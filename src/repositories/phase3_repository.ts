import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type {
  ProjectRecord,
  ProjectState,
  RegistryPackageRecord,
  RegistryVersionRecord,
  TeamMemberRecord,
  TeamRecord,
} from "../domain/phase3.ts";

interface TeamRow {
  id: string;
  organization_id: string;
  organization_slug: string;
  slug: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface TeamMemberRow {
  id: string;
  team_id: string;
  user_id: string;
  username: string;
  created_at: string;
}

interface ProjectRow {
  id: string;
  repository_id: string;
  number: number;
  title: string;
  body: string;
  state: ProjectState;
  author: string;
  created_at: string;
  updated_at: string;
}

interface RegistryPackageRow {
  id: string;
  scope: string;
  name: string;
  description: string;
  owner: string;
  created_at: string;
  updated_at: string;
}

interface RegistryVersionRow {
  id: string;
  package_id: string;
  version: string;
  module_path: string;
  source: string;
  checksum: string;
  author: string;
  created_at: string;
}

interface UserIdRow {
  id: string;
}

export class Phase3Repository {
  constructor(private readonly database: DatabaseGateway) {}

  async createTeam(team: TeamRecord): Promise<TeamRecord> {
    await this.database.execute(`
      INSERT INTO teams (id, organization_id, slug, name, created_at, updated_at)
      VALUES (
        ${quoteSqlText(team.id)},
        ${quoteSqlText(team.organizationId)},
        ${quoteSqlText(team.slug)},
        ${quoteSqlText(team.name)},
        ${quoteSqlText(team.createdAt)},
        ${quoteSqlText(team.updatedAt)}
      );
    `);
    return team;
  }

  async listTeams(organizationSlug: string): Promise<TeamRecord[]> {
    const rows = await this.database.query<TeamRow>(`
      SELECT
        teams.id,
        teams.organization_id,
        organizations.slug AS organization_slug,
        teams.slug,
        teams.name,
        teams.created_at,
        teams.updated_at
      FROM teams
      JOIN organizations ON organizations.id = teams.organization_id
      WHERE organizations.slug = ${quoteSqlText(organizationSlug)}
      ORDER BY teams.slug ASC;
    `);
    return rows.map(toTeam);
  }

  async findTeam(
    organizationSlug: string,
    teamSlug: string,
  ): Promise<TeamRecord | null> {
    const rows = await this.database.query<TeamRow>(`
      SELECT
        teams.id,
        teams.organization_id,
        organizations.slug AS organization_slug,
        teams.slug,
        teams.name,
        teams.created_at,
        teams.updated_at
      FROM teams
      JOIN organizations ON organizations.id = teams.organization_id
      WHERE organizations.slug = ${quoteSqlText(organizationSlug)}
        AND teams.slug = ${quoteSqlText(teamSlug)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toTeam(rows[0]);
  }

  async findUserIdByUsername(username: string): Promise<string | null> {
    const rows = await this.database.query<UserIdRow>(`
      SELECT id FROM users WHERE username = ${quoteSqlText(username)} LIMIT 1;
    `);
    return rows[0]?.id ?? null;
  }

  async addTeamMember(input: {
    readonly id: string;
    readonly teamId: string;
    readonly userId: string;
    readonly createdAt: string;
  }): Promise<TeamMemberRecord> {
    await this.database.execute(`
      INSERT INTO team_members (id, team_id, user_id, created_at)
      VALUES (
        ${quoteSqlText(input.id)},
        ${quoteSqlText(input.teamId)},
        ${quoteSqlText(input.userId)},
        ${quoteSqlText(input.createdAt)}
      );
    `);
    const rows = await this.database.query<TeamMemberRow>(`
      SELECT
        team_members.id,
        team_members.team_id,
        team_members.user_id,
        users.username,
        team_members.created_at
      FROM team_members
      JOIN users ON users.id = team_members.user_id
      WHERE team_members.id = ${quoteSqlText(input.id)}
      LIMIT 1;
    `);
    return toTeamMember(rows[0]);
  }

  async listTeamMembers(
    organizationSlug: string,
    teamSlug: string,
  ): Promise<TeamMemberRecord[]> {
    const rows = await this.database.query<TeamMemberRow>(`
      SELECT
        team_members.id,
        team_members.team_id,
        team_members.user_id,
        users.username,
        team_members.created_at
      FROM team_members
      JOIN teams ON teams.id = team_members.team_id
      JOIN organizations ON organizations.id = teams.organization_id
      JOIN users ON users.id = team_members.user_id
      WHERE organizations.slug = ${quoteSqlText(organizationSlug)}
        AND teams.slug = ${quoteSqlText(teamSlug)}
      ORDER BY users.username ASC;
    `);
    return rows.map(toTeamMember);
  }

  async nextProjectNumber(repositoryId: string): Promise<number> {
    const rows = await this.database.query<{ next_number: number }>(`
      SELECT COALESCE(MAX(number), 0) + 1 AS next_number
      FROM projects
      WHERE repository_id = ${quoteSqlText(repositoryId)};
    `);
    return rows[0]?.next_number ?? 1;
  }

  async createProject(project: ProjectRecord): Promise<ProjectRecord> {
    await this.database.execute(`
      INSERT INTO projects (id, repository_id, number, title, body, state, author, created_at, updated_at)
      VALUES (
        ${quoteSqlText(project.id)},
        ${quoteSqlText(project.repositoryId)},
        ${project.number},
        ${quoteSqlText(project.title)},
        ${quoteSqlText(project.body)},
        ${quoteSqlText(project.state)},
        ${quoteSqlText(project.author)},
        ${quoteSqlText(project.createdAt)},
        ${quoteSqlText(project.updatedAt)}
      );
    `);
    return project;
  }

  async listProjects(repositoryId: string): Promise<ProjectRecord[]> {
    const rows = await this.database.query<ProjectRow>(`
      SELECT id, repository_id, number, title, body, state, author, created_at, updated_at
      FROM projects
      WHERE repository_id = ${quoteSqlText(repositoryId)}
      ORDER BY number ASC;
    `);
    return rows.map(toProject);
  }

  async findProject(
    repositoryId: string,
    number: number,
  ): Promise<ProjectRecord | null> {
    const rows = await this.database.query<ProjectRow>(`
      SELECT id, repository_id, number, title, body, state, author, created_at, updated_at
      FROM projects
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toProject(rows[0]);
  }

  async updateProject(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: ProjectState;
      readonly updatedAt: string;
    },
  ): Promise<ProjectRecord | null> {
    await this.database.execute(`
      UPDATE projects
      SET title = ${quoteSqlText(fields.title)},
          body = ${quoteSqlText(fields.body)},
          state = ${quoteSqlText(fields.state)},
          updated_at = ${quoteSqlText(fields.updatedAt)}
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number};
    `);
    return await this.findProject(repositoryId, number);
  }

  async createRegistryPackage(
    record: RegistryPackageRecord,
  ): Promise<RegistryPackageRecord> {
    await this.database.execute(`
      INSERT INTO registry_packages (id, scope, name, description, owner, created_at, updated_at)
      VALUES (
        ${quoteSqlText(record.id)},
        ${quoteSqlText(record.scope)},
        ${quoteSqlText(record.name)},
        ${quoteSqlText(record.description)},
        ${quoteSqlText(record.owner)},
        ${quoteSqlText(record.createdAt)},
        ${quoteSqlText(record.updatedAt)}
      );
    `);
    return record;
  }

  async findRegistryPackage(
    scope: string,
    name: string,
  ): Promise<RegistryPackageRecord | null> {
    const rows = await this.database.query<RegistryPackageRow>(`
      SELECT id, scope, name, description, owner, created_at, updated_at
      FROM registry_packages
      WHERE scope = ${quoteSqlText(scope)}
        AND name = ${quoteSqlText(name)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toRegistryPackage(rows[0]);
  }

  async listRegistryPackages(
    scope?: string,
  ): Promise<RegistryPackageRecord[]> {
    const filter = scope === undefined
      ? ""
      : `WHERE scope = ${quoteSqlText(scope)}`;
    const rows = await this.database.query<RegistryPackageRow>(`
      SELECT id, scope, name, description, owner, created_at, updated_at
      FROM registry_packages
      ${filter}
      ORDER BY scope ASC, name ASC;
    `);
    return rows.map(toRegistryPackage);
  }

  async createRegistryVersion(
    record: RegistryVersionRecord,
  ): Promise<RegistryVersionRecord> {
    await this.database.execute(`
      INSERT INTO registry_versions (id, package_id, version, module_path, source, checksum, author, created_at)
      VALUES (
        ${quoteSqlText(record.id)},
        ${quoteSqlText(record.packageId)},
        ${quoteSqlText(record.version)},
        ${quoteSqlText(record.modulePath)},
        ${quoteSqlText(record.source)},
        ${quoteSqlText(record.checksum)},
        ${quoteSqlText(record.author)},
        ${quoteSqlText(record.createdAt)}
      );
    `);
    return record;
  }

  async listRegistryVersions(
    packageId: string,
  ): Promise<RegistryVersionRecord[]> {
    const rows = await this.database.query<RegistryVersionRow>(`
      SELECT id, package_id, version, module_path, source, checksum, author, created_at
      FROM registry_versions
      WHERE package_id = ${quoteSqlText(packageId)}
      ORDER BY created_at ASC;
    `);
    return rows.map(toRegistryVersion);
  }

  async findRegistryVersion(
    packageId: string,
    version: string,
  ): Promise<RegistryVersionRecord | null> {
    const rows = await this.database.query<RegistryVersionRow>(`
      SELECT id, package_id, version, module_path, source, checksum, author, created_at
      FROM registry_versions
      WHERE package_id = ${quoteSqlText(packageId)}
        AND version = ${quoteSqlText(version)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toRegistryVersion(rows[0]);
  }
}

function toTeam(row: TeamRow): TeamRecord {
  return {
    id: row.id,
    organizationId: row.organization_id,
    organizationSlug: row.organization_slug,
    slug: row.slug,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toTeamMember(row: TeamMemberRow): TeamMemberRecord {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    username: row.username,
    createdAt: row.created_at,
  };
}

function toProject(row: ProjectRow): ProjectRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    number: row.number,
    title: row.title,
    body: row.body,
    state: row.state,
    author: row.author,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRegistryPackage(row: RegistryPackageRow): RegistryPackageRecord {
  return {
    id: row.id,
    scope: row.scope,
    name: row.name,
    description: row.description,
    owner: row.owner,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRegistryVersion(row: RegistryVersionRow): RegistryVersionRecord {
  return {
    id: row.id,
    packageId: row.package_id,
    version: row.version,
    modulePath: row.module_path,
    source: row.source,
    checksum: row.checksum,
    author: row.author,
    createdAt: row.created_at,
  };
}
