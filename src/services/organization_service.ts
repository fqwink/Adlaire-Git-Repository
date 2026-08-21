import {
  type OrganizationInput,
  type OrganizationMemberRecord,
  type OrganizationMemberRole,
  type OrganizationRecord,
  validateOrganizationName,
  validateOrganizationSlug,
} from "../domain/organization.ts";
import type { Principal } from "../domain/user.ts";
import type { AuditSink } from "./audit_service.ts";

export interface OrganizationStore {
  createWithOwner(input: {
    readonly organization: OrganizationRecord;
    readonly ownerMember: Omit<OrganizationMemberRecord, "username">;
  }): Promise<OrganizationRecord>;
  listForActor(actor: Principal): Promise<OrganizationRecord[]>;
  findBySlug(slug: string): Promise<OrganizationRecord | null>;
  listMembers(slug: string): Promise<OrganizationMemberRecord[]>;
  findMembership(
    slug: string,
    userId: string,
  ): Promise<OrganizationMemberRecord | null>;
  findUserIdByUsername(username: string): Promise<string | null>;
  addMember(input: {
    readonly id: string;
    readonly organizationId: string;
    readonly userId: string;
    readonly role: OrganizationMemberRole;
    readonly createdAt: string;
  }): Promise<OrganizationMemberRecord>;
}

export class OrganizationService {
  constructor(
    private readonly organizations: OrganizationStore,
    private readonly audit: AuditSink,
  ) {}

  async createOrganization(
    input: OrganizationInput,
    actor: Principal,
  ): Promise<OrganizationRecord> {
    const slug = validateOrganizationSlug(input.slug);
    const name = validateOrganizationName(input.name);
    const now = new Date().toISOString();
    const organizationId = crypto.randomUUID();
    const organization = await this.organizations.createWithOwner({
      organization: {
        id: organizationId,
        slug,
        name,
        createdBy: actor.id,
        createdAt: now,
        updatedAt: now,
      },
      ownerMember: {
        id: crypto.randomUUID(),
        organizationId,
        userId: actor.id,
        role: "owner",
        createdAt: now,
      },
    });

    await this.audit.record({
      actor: actor.username,
      action: "organization.create",
      targetType: "organization",
      targetId: organization.id,
    });

    return organization;
  }

  listOrganizations(actor: Principal): Promise<OrganizationRecord[]> {
    return this.organizations.listForActor(actor);
  }

  async getOrganization(
    slug: string,
    actor: Principal,
  ): Promise<{
    readonly organization: OrganizationRecord;
    readonly members: OrganizationMemberRecord[];
  }> {
    const organization = await this.requireReadableOrganization(slug, actor);
    return {
      organization,
      members: await this.organizations.listMembers(organization.slug),
    };
  }

  async addMember(
    slug: string,
    input: {
      readonly username: string;
      readonly role: OrganizationMemberRole;
    },
    actor: Principal,
  ): Promise<OrganizationMemberRecord> {
    const organization = await this.requireWritableOrganization(slug, actor);
    const userId = await this.organizations.findUserIdByUsername(
      input.username,
    );
    if (userId === null) {
      throw new Response("user not found.", { status: 404 });
    }

    const member = await this.organizations.addMember({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      userId,
      role: input.role,
      createdAt: new Date().toISOString(),
    });

    await this.audit.record({
      actor: actor.username,
      action: "organization.member.add",
      targetType: "organization",
      targetId: organization.id,
    });

    return member;
  }

  async requireReadableOrganization(
    slug: string,
    actor: Principal,
  ): Promise<OrganizationRecord> {
    const safeSlug = validateOrganizationSlug(slug);
    const organization = await this.organizations.findBySlug(safeSlug);
    if (organization === null) {
      throw new Response("organization not found.", { status: 404 });
    }
    if (
      actor.role === "admin" ||
      (await this.organizations.findMembership(safeSlug, actor.id)) !== null
    ) {
      return organization;
    }
    throw new Response("organization access denied.", { status: 403 });
  }

  async requireWritableOrganization(
    slug: string,
    actor: Principal,
  ): Promise<OrganizationRecord> {
    const organization = await this.requireReadableOrganization(slug, actor);
    if (actor.role === "admin") {
      return organization;
    }
    const membership = await this.organizations.findMembership(
      organization.slug,
      actor.id,
    );
    if (membership?.role === "owner") {
      return organization;
    }
    throw new Response("organization write access denied.", { status: 403 });
  }
}
