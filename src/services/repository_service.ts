import {
  createRepositoryId,
  type RepositoryInput,
  type RepositoryDetail,
  type RepositoryRecord,
  type RepositoryVisibility,
  validateRepositoryName
} from "../domain/repository.ts";
import type { Principal } from "../domain/user.ts";
import type { AuditSink } from "./audit_service.ts";

export interface RepositoryStore {
  create(record: RepositoryRecord): Promise<RepositoryRecord>;
  list(): Promise<RepositoryRecord[]>;
  listVisibleTo(username: string | null, isAdmin: boolean): Promise<RepositoryRecord[]>;
  find(owner: string, name: string): Promise<RepositoryRecord | null>;
  updateVisibility(owner: string, name: string, visibility: RepositoryVisibility, updatedAt: string): Promise<RepositoryRecord | null>;
  delete(owner: string, name: string): Promise<void>;
}

export interface GitStorage {
  initializeBareRepository(owner: string, name: string): Promise<string>;
  deleteRepository(owner: string, name: string): Promise<void>;
  listBranches(owner: string, name: string): Promise<string[]>;
  listTags(owner: string, name: string): Promise<string[]>;
  readReadme(owner: string, name: string): Promise<string | null>;
}

export class RepositoryService {
  constructor(
    private readonly repositoryRepository: RepositoryStore,
    private readonly git: GitStorage,
    private readonly audit: AuditSink
  ) {}

  async createRepository(input: RepositoryInput, actor: Principal): Promise<RepositoryRecord> {
    const owner = validateRepositoryName(input.owner, "owner");
    const name = validateRepositoryName(input.name, "name");
    const now = new Date().toISOString();
    const barePath = await this.git.initializeBareRepository(owner, name);

    const created = await this.repositoryRepository.create({
      id: createRepositoryId(owner, name),
      owner,
      name,
      visibility: input.visibility,
      barePath,
      createdAt: now,
      updatedAt: now
    });

    await this.audit.record({
      actor: actor.username,
      action: "repository.create",
      targetType: "repository",
      targetId: created.id
    });

    return created;
  }

  listRepositories(actor: Principal | null): Promise<RepositoryRecord[]> {
    return this.repositoryRepository.listVisibleTo(actor?.username ?? null, actor?.role === "admin");
  }

  async getRepository(owner: string, name: string, actor: Principal | null): Promise<RepositoryDetail> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const [branches, tags, readme] = await Promise.all([
      this.git.listBranches(repository.owner, repository.name),
      this.git.listTags(repository.owner, repository.name),
      this.git.readReadme(repository.owner, repository.name)
    ]);

    return {
      ...repository,
      branches,
      tags,
      readme
    };
  }

  async updateVisibility(owner: string, name: string, visibility: RepositoryVisibility, actor: Principal): Promise<RepositoryRecord> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    const updated = await this.repositoryRepository.updateVisibility(repository.owner, repository.name, visibility, new Date().toISOString());
    if (updated === null) {
      throw new Response("repository not found.", { status: 404 });
    }

    await this.audit.record({
      actor: actor.username,
      action: "repository.visibility.update",
      targetType: "repository",
      targetId: updated.id
    });

    return updated;
  }

  async deleteRepository(owner: string, name: string, actor: Principal): Promise<void> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    await this.repositoryRepository.delete(repository.owner, repository.name);
    await this.git.deleteRepository(repository.owner, repository.name);
    await this.audit.record({
      actor: actor.username,
      action: "repository.delete",
      targetType: "repository",
      targetId: repository.id
    });
  }

  async requireVisibleRepository(owner: string, name: string, actor: Principal | null): Promise<RepositoryRecord> {
    const safeOwner = validateRepositoryName(owner, "owner");
    const safeName = validateRepositoryName(name, "name");
    const repository = await this.repositoryRepository.find(safeOwner, safeName);
    if (repository === null) {
      throw new Response("repository not found.", { status: 404 });
    }

    if (repository.visibility === "public" || actor?.role === "admin" || actor?.username === repository.owner) {
      return repository;
    }

    throw new Response("repository access denied.", { status: 403 });
  }

  async requireWritableRepository(owner: string, name: string, actor: Principal): Promise<RepositoryRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    if (actor.role === "admin" || actor.username === repository.owner) {
      return repository;
    }
    throw new Response("repository write access denied.", { status: 403 });
  }
}
