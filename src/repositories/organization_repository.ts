import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type {
  OrganizationMemberRecord,
  OrganizationMemberRole,
  OrganizationRecord,
} from "../domain/organization.ts";
import type { Principal } from "../domain/user.ts";

interface OrganizationRow {
  id: string;
  slug: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface OrganizationMemberRow {
  id: string;
  organization_id: string;
  user_id: string;
  username: string;
  role: OrganizationMemberRole;
  created_at: string;
}

interface UserIdRow {
  id: string;
}

export class OrganizationRepository {
  constructor(private readonly database: DatabaseGateway) {}

  async createWithOwner(input: {
    readonly organization: OrganizationRecord;
    readonly ownerMember: Omit<OrganizationMemberRecord, "username">;
  }): Promise<OrganizationRecord> {
    await this.database.execute(`
      INSERT INTO organizations (id, slug, name, created_by, created_at, updated_at)
      VALUES (
        ${quoteSqlText(input.organization.id)},
        ${quoteSqlText(input.organization.slug)},
        ${quoteSqlText(input.organization.name)},
        ${quoteSqlText(input.organization.createdBy)},
        ${quoteSqlText(input.organization.createdAt)},
        ${quoteSqlText(input.organization.updatedAt)}
      );

      INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
      VALUES (
        ${quoteSqlText(input.ownerMember.id)},
        ${quoteSqlText(input.ownerMember.organizationId)},
        ${quoteSqlText(input.ownerMember.userId)},
        ${quoteSqlText(input.ownerMember.role)},
        ${quoteSqlText(input.ownerMember.createdAt)}
      );
    `);

    return input.organization;
  }

  async listForActor(actor: Principal): Promise<OrganizationRecord[]> {
    const filter = actor.role === "admin" ? "1 = 1" : `organizations.id IN (
          SELECT organization_id
          FROM organization_members
          WHERE user_id = ${quoteSqlText(actor.id)}
        )`;
    const rows = await this.database.query<OrganizationRow>(`
      SELECT id, slug, name, created_by, created_at, updated_at
      FROM organizations
      WHERE ${filter}
      ORDER BY slug ASC;
    `);
    return rows.map(toOrganizationRecord);
  }

  async findBySlug(slug: string): Promise<OrganizationRecord | null> {
    const rows = await this.database.query<OrganizationRow>(`
      SELECT id, slug, name, created_by, created_at, updated_at
      FROM organizations
      WHERE slug = ${quoteSqlText(slug)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toOrganizationRecord(rows[0]);
  }

  async listMembers(slug: string): Promise<OrganizationMemberRecord[]> {
    const rows = await this.database.query<OrganizationMemberRow>(`
      SELECT
        organization_members.id,
        organization_members.organization_id,
        organization_members.user_id,
        users.username,
        organization_members.role,
        organization_members.created_at
      FROM organization_members
      JOIN organizations ON organizations.id = organization_members.organization_id
      JOIN users ON users.id = organization_members.user_id
      WHERE organizations.slug = ${quoteSqlText(slug)}
      ORDER BY users.username ASC;
    `);
    return rows.map(toOrganizationMemberRecord);
  }

  async findMembership(
    slug: string,
    userId: string,
  ): Promise<OrganizationMemberRecord | null> {
    const rows = await this.database.query<OrganizationMemberRow>(`
      SELECT
        organization_members.id,
        organization_members.organization_id,
        organization_members.user_id,
        users.username,
        organization_members.role,
        organization_members.created_at
      FROM organization_members
      JOIN organizations ON organizations.id = organization_members.organization_id
      JOIN users ON users.id = organization_members.user_id
      WHERE organizations.slug = ${quoteSqlText(slug)}
        AND organization_members.user_id = ${quoteSqlText(userId)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toOrganizationMemberRecord(rows[0]);
  }

  async findUserIdByUsername(username: string): Promise<string | null> {
    const rows = await this.database.query<UserIdRow>(`
      SELECT id
      FROM users
      WHERE username = ${quoteSqlText(username)}
      LIMIT 1;
    `);
    return rows[0]?.id ?? null;
  }

  async addMember(input: {
    readonly id: string;
    readonly organizationId: string;
    readonly userId: string;
    readonly role: OrganizationMemberRole;
    readonly createdAt: string;
  }): Promise<OrganizationMemberRecord> {
    await this.database.execute(`
      INSERT INTO organization_members (id, organization_id, user_id, role, created_at)
      VALUES (
        ${quoteSqlText(input.id)},
        ${quoteSqlText(input.organizationId)},
        ${quoteSqlText(input.userId)},
        ${quoteSqlText(input.role)},
        ${quoteSqlText(input.createdAt)}
      );
    `);

    const rows = await this.database.query<OrganizationMemberRow>(`
      SELECT
        organization_members.id,
        organization_members.organization_id,
        organization_members.user_id,
        users.username,
        organization_members.role,
        organization_members.created_at
      FROM organization_members
      JOIN users ON users.id = organization_members.user_id
      WHERE organization_members.id = ${quoteSqlText(input.id)}
      LIMIT 1;
    `);
    return toOrganizationMemberRecord(rows[0]);
  }

  async canReadOwner(owner: string, actor: Principal | null): Promise<boolean> {
    if (actor === null) {
      return false;
    }
    if (actor.role === "admin" || actor.username === owner) {
      return true;
    }
    return (await this.findMembership(owner, actor.id)) !== null;
  }

  async canWriteOwner(owner: string, actor: Principal): Promise<boolean> {
    if (actor.role === "admin" || actor.username === owner) {
      return true;
    }
    const membership = await this.findMembership(owner, actor.id);
    return membership?.role === "owner";
  }
}

function toOrganizationRecord(row: OrganizationRow): OrganizationRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toOrganizationMemberRecord(
  row: OrganizationMemberRow,
): OrganizationMemberRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at,
  };
}
