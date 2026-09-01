import type { Principal } from "../domain/user.ts";
import type {
  ProjectRecord,
  ProjectState,
  RegistryPackageRecord,
  RegistryVersionRecord,
  TeamMemberRecord,
  TeamRecord,
} from "../domain/phase3.ts";
import {
  validateModulePath,
  validateProjectState,
  validateRegistryPackageName,
  validateRegistryScope,
  validateRegistryVersion,
  validateRequiredText,
  validateTeamSlug,
  validateText,
} from "../domain/phase3.ts";
import type { AuditSink } from "./audit_service.ts";
import type { OrganizationService } from "./organization_service.ts";
import type { RepositoryService } from "./repository_service.ts";

export interface Phase3Store {
  createTeam(team: TeamRecord): Promise<TeamRecord>;
  listTeams(organizationSlug: string): Promise<TeamRecord[]>;
  findTeam(
    organizationSlug: string,
    teamSlug: string,
  ): Promise<TeamRecord | null>;
  findUserIdByUsername(username: string): Promise<string | null>;
  addTeamMember(input: {
    readonly id: string;
    readonly teamId: string;
    readonly userId: string;
    readonly createdAt: string;
  }): Promise<TeamMemberRecord>;
  listTeamMembers(
    organizationSlug: string,
    teamSlug: string,
  ): Promise<TeamMemberRecord[]>;
  nextProjectNumber(repositoryId: string): Promise<number>;
  createProject(project: ProjectRecord): Promise<ProjectRecord>;
  listProjects(repositoryId: string): Promise<ProjectRecord[]>;
  findProject(
    repositoryId: string,
    number: number,
  ): Promise<ProjectRecord | null>;
  updateProject(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: ProjectState;
      readonly updatedAt: string;
    },
  ): Promise<ProjectRecord | null>;
  createRegistryPackage(
    record: RegistryPackageRecord,
  ): Promise<RegistryPackageRecord>;
  findRegistryPackage(
    scope: string,
    name: string,
  ): Promise<RegistryPackageRecord | null>;
  listRegistryPackages(scope?: string): Promise<RegistryPackageRecord[]>;
  createRegistryVersion(
    record: RegistryVersionRecord,
  ): Promise<RegistryVersionRecord>;
  listRegistryVersions(packageId: string): Promise<RegistryVersionRecord[]>;
  findRegistryVersion(
    packageId: string,
    version: string,
  ): Promise<RegistryVersionRecord | null>;
}

export class Phase3Service {
  constructor(
    private readonly store: Phase3Store,
    private readonly organizations: OrganizationService,
    private readonly repositories: RepositoryService,
    private readonly audit: AuditSink,
  ) {}

  async createTeam(
    organizationSlug: string,
    input: { readonly slug: string; readonly name: string },
    actor: Principal,
  ): Promise<TeamRecord> {
    const organization = await this.organizations.requireWritableOrganization(
      organizationSlug,
      actor,
    );
    const slug = validateTeamSlug(input.slug);
    const now = new Date().toISOString();
    const team = await this.store.createTeam({
      id: crypto.randomUUID(),
      organizationId: organization.id,
      organizationSlug: organization.slug,
      slug,
      name: validateRequiredText(input.name, "team name", 120),
      createdAt: now,
      updatedAt: now,
    });
    await this.record(actor, "team.create", "team", team.id);
    return team;
  }

  async listTeams(
    organizationSlug: string,
    actor: Principal,
  ): Promise<TeamRecord[]> {
    const organization = await this.organizations.requireReadableOrganization(
      organizationSlug,
      actor,
    );
    return await this.store.listTeams(organization.slug);
  }

  async addTeamMember(
    organizationSlug: string,
    teamSlug: string,
    input: { readonly username: string },
    actor: Principal,
  ): Promise<TeamMemberRecord> {
    await this.organizations.requireWritableOrganization(
      organizationSlug,
      actor,
    );
    const team = await this.requireTeam(organizationSlug, teamSlug);
    const userId = await this.store.findUserIdByUsername(input.username);
    if (userId === null) {
      throw new Response("user not found.", { status: 404 });
    }
    if (!(await this.organizations.isMember(organizationSlug, userId))) {
      throw new Response("team member must belong to organization.", {
        status: 403,
      });
    }
    const member = await this.store.addTeamMember({
      id: crypto.randomUUID(),
      teamId: team.id,
      userId,
      createdAt: new Date().toISOString(),
    });
    await this.record(actor, "team.member.add", "team", team.id);
    return member;
  }

  async listTeamMembers(
    organizationSlug: string,
    teamSlug: string,
    actor: Principal,
  ): Promise<TeamMemberRecord[]> {
    await this.organizations.requireReadableOrganization(
      organizationSlug,
      actor,
    );
    await this.requireTeam(organizationSlug, teamSlug);
    return await this.store.listTeamMembers(organizationSlug, teamSlug);
  }

  async createProject(
    owner: string,
    name: string,
    input: { readonly title: string; readonly body?: string },
    actor: Principal,
  ): Promise<ProjectRecord> {
    const repository = await this.repositories.requireWritableRepository(
      owner,
      name,
      actor,
    );
    const now = new Date().toISOString();
    const number = await this.store.nextProjectNumber(repository.id);
    const project = await this.store.createProject({
      id: `${repository.id}/projects/${number}`,
      repositoryId: repository.id,
      number,
      title: validateRequiredText(input.title, "project title", 200),
      body: validateText(input.body, "project body", 50000),
      state: "open",
      author: actor.username,
      createdAt: now,
      updatedAt: now,
    });
    await this.record(actor, "project.create", "project", project.id);
    return project;
  }

  async listProjects(
    owner: string,
    name: string,
    actor: Principal | null,
  ): Promise<ProjectRecord[]> {
    const repository = await this.repositories.requireVisibleRepository(
      owner,
      name,
      actor,
    );
    return await this.store.listProjects(repository.id);
  }

  async updateProject(
    owner: string,
    name: string,
    number: number,
    input: {
      readonly title?: string;
      readonly body?: string;
      readonly state?: ProjectState;
    },
    actor: Principal,
  ): Promise<ProjectRecord> {
    const repository = await this.repositories.requireWritableRepository(
      owner,
      name,
      actor,
    );
    const current = await this.store.findProject(repository.id, number);
    if (current === null) {
      throw new Response("project not found.", { status: 404 });
    }
    const updated = await this.store.updateProject(repository.id, number, {
      title: input.title === undefined
        ? current.title
        : validateRequiredText(input.title, "project title", 200),
      body: input.body === undefined
        ? current.body
        : validateText(input.body, "project body", 50000),
      state: input.state === undefined
        ? current.state
        : validateProjectState(input.state),
      updatedAt: new Date().toISOString(),
    });
    if (updated === null) {
      throw new Response("project not found.", { status: 404 });
    }
    await this.record(actor, "project.update", "project", updated.id);
    return updated;
  }

  async createRegistryPackage(
    input: {
      readonly scope: string;
      readonly name: string;
      readonly description?: string;
    },
    actor: Principal,
  ): Promise<RegistryPackageRecord> {
    const scope = validateRegistryScope(input.scope);
    await this.requireScopeWrite(scope, actor);
    const name = validateRegistryPackageName(input.name);
    const now = new Date().toISOString();
    const pack = await this.store.createRegistryPackage({
      id: `${scope}/${name}`,
      scope,
      name,
      description: validateText(input.description, "description", 500),
      owner: actor.username,
      createdAt: now,
      updatedAt: now,
    });
    await this.record(
      actor,
      "registry.package.create",
      "registry_package",
      pack.id,
    );
    return pack;
  }

  async listRegistryPackages(
    scope: string | undefined,
    actor: Principal,
  ): Promise<RegistryPackageRecord[]> {
    if (scope !== undefined) {
      const safeScope = validateRegistryScope(scope);
      await this.requireScopeRead(safeScope, actor);
      return await this.store.listRegistryPackages(safeScope);
    }

    const packages = await this.store.listRegistryPackages();
    const visible: RegistryPackageRecord[] = [];
    for (const pack of packages) {
      if (await this.canReadScope(pack.scope, actor)) {
        visible.push(pack);
      }
    }
    return visible;
  }

  async publishRegistryVersion(
    scope: string,
    name: string,
    input: {
      readonly version: string;
      readonly modulePath: string;
      readonly source: string;
    },
    actor: Principal,
  ): Promise<RegistryVersionRecord> {
    const safeScope = validateRegistryScope(scope);
    await this.requireScopeWrite(safeScope, actor);
    const pack = await this.requireRegistryPackage(
      safeScope,
      validateRegistryPackageName(name),
    );
    const source = validateModuleSource(input.source);
    const version = await this.store.createRegistryVersion({
      id: `${pack.id}@${validateRegistryVersion(input.version)}`,
      packageId: pack.id,
      version: validateRegistryVersion(input.version),
      modulePath: validateModulePath(input.modulePath),
      source,
      checksum: await sha256Hex(source),
      author: actor.username,
      createdAt: new Date().toISOString(),
    });
    await this.record(
      actor,
      "registry.version.publish",
      "registry_version",
      version.id,
    );
    return version;
  }

  async listRegistryVersions(
    scope: string,
    name: string,
    actor: Principal,
  ): Promise<RegistryVersionRecord[]> {
    const pack = await this.requireReadableRegistryPackage(scope, name, actor);
    return await this.store.listRegistryVersions(pack.id);
  }

  async downloadRegistryVersion(
    scope: string,
    name: string,
    version: string,
    actor: Principal,
  ): Promise<RegistryVersionRecord> {
    const pack = await this.requireReadableRegistryPackage(scope, name, actor);
    const record = await this.store.findRegistryVersion(
      pack.id,
      validateRegistryVersion(version),
    );
    if (record === null) {
      throw new Response("registry version not found.", { status: 404 });
    }
    await this.record(
      actor,
      "registry.version.download",
      "registry_version",
      record.id,
    );
    return record;
  }

  libsqlEvaluation(): {
    readonly status: "adopted";
    readonly driver: "libsql";
    readonly candidate: "libsql";
    readonly conclusion: string;
  } {
    return {
      status: "adopted",
      driver: "libsql",
      candidate: "libsql",
      conclusion:
        "Phase 8.7 stabilizes libSQL behind the Database Gateway and the system/data split before the Phase 9 judgment.",
    };
  }

  operationsStatus(): {
    readonly phase: "Phase 8.7";
    readonly runtime: "Deno";
    readonly databaseDriver: "libsql";
    readonly nodeRuntime: "forbidden";
  } {
    return {
      phase: "Phase 8.7",
      runtime: "Deno",
      databaseDriver: "libsql",
      nodeRuntime: "forbidden",
    };
  }

  private async requireTeam(
    organizationSlug: string,
    teamSlug: string,
  ): Promise<TeamRecord> {
    const team = await this.store.findTeam(
      organizationSlug,
      validateTeamSlug(teamSlug),
    );
    if (team === null) {
      throw new Response("team not found.", { status: 404 });
    }
    return team;
  }

  private async requireReadableRegistryPackage(
    scope: string,
    name: string,
    actor: Principal,
  ): Promise<RegistryPackageRecord> {
    const safeScope = validateRegistryScope(scope);
    await this.requireScopeRead(safeScope, actor);
    return await this.requireRegistryPackage(
      safeScope,
      validateRegistryPackageName(name),
    );
  }

  private async requireRegistryPackage(
    scope: string,
    name: string,
  ): Promise<RegistryPackageRecord> {
    const pack = await this.store.findRegistryPackage(scope, name);
    if (pack === null) {
      throw new Response("registry package not found.", { status: 404 });
    }
    return pack;
  }

  private async requireScopeRead(
    scope: string,
    actor: Principal,
  ): Promise<void> {
    if (actor.role === "admin" || actor.username === scope) {
      return;
    }
    try {
      await this.organizations.requireReadableOrganization(scope, actor);
      return;
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        throw new Response("registry scope not found.", { status: 404 });
      }
      throw error;
    }
  }

  private async canReadScope(
    scope: string,
    actor: Principal,
  ): Promise<boolean> {
    try {
      await this.requireScopeRead(scope, actor);
      return true;
    } catch (error) {
      if (error instanceof Response) {
        return false;
      }
      throw error;
    }
  }

  private async requireScopeWrite(
    scope: string,
    actor: Principal,
  ): Promise<void> {
    if (actor.role === "admin" || actor.username === scope) {
      return;
    }
    try {
      await this.organizations.requireWritableOrganization(scope, actor);
      return;
    } catch (error) {
      if (error instanceof Response && error.status === 404) {
        throw new Response("registry scope not found.", { status: 404 });
      }
      throw error;
    }
  }

  private record(
    actor: Principal,
    action: string,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    return this.audit.record({
      actor: actor.username,
      action,
      targetType,
      targetId,
    });
  }
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function validateModuleSource(value: string): string {
  if (value.trim() === "") {
    throw new Response("source is required.", { status: 400 });
  }
  if (value.length > 500000) {
    throw new Response("source is too long.", { status: 400 });
  }
  return value;
}
