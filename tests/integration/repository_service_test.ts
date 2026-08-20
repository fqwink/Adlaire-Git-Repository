import type { RepositoryRecord } from "../../src/domain/repository.ts";
import type { Principal } from "../../src/domain/user.ts";
import { RepositoryService } from "../../src/services/repository_service.ts";
import { assertEquals, assertRejectsAsync } from "../support/assert.ts";

class MemoryRepository {
  records: RepositoryRecord[] = [];

  create(record: RepositoryRecord): Promise<RepositoryRecord> {
    this.records.push(record);
    return Promise.resolve(record);
  }

  list(): Promise<RepositoryRecord[]> {
    return Promise.resolve(this.records);
  }

  listVisibleTo(username: string | null, isAdmin: boolean): Promise<RepositoryRecord[]> {
    if (isAdmin) {
      return Promise.resolve(this.records);
    }
    return Promise.resolve(
      this.records.filter((record) => record.visibility === "public" || record.owner === username)
    );
  }

  find(owner: string, name: string): Promise<RepositoryRecord | null> {
    return Promise.resolve(this.records.find((record) => record.owner === owner && record.name === name) ?? null);
  }

  updateVisibility(owner: string, name: string, visibility: "public" | "private", updatedAt: string): Promise<RepositoryRecord | null> {
    const index = this.records.findIndex((record) => record.owner === owner && record.name === name);
    if (index < 0) {
      return Promise.resolve(null);
    }
    this.records[index] = { ...this.records[index], visibility, updatedAt };
    return Promise.resolve(this.records[index]);
  }

  delete(owner: string, name: string): Promise<void> {
    this.records = this.records.filter((record) => record.owner !== owner || record.name !== name);
    return Promise.resolve();
  }
}

class MemoryGit {
  initialized: string[] = [];

  initializeBareRepository(owner: string, name: string): Promise<string> {
    const path = `/repos/${owner}/${name}.git`;
    this.initialized.push(path);
    return Promise.resolve(path);
  }

  deleteRepository(): Promise<void> {
    return Promise.resolve();
  }

  listBranches(): Promise<string[]> {
    return Promise.resolve(["main"]);
  }

  listTags(): Promise<string[]> {
    return Promise.resolve([]);
  }

  readReadme(): Promise<string | null> {
    return Promise.resolve("# Project");
  }
}

class MemoryAudit {
  actions: string[] = [];

  record(input: { readonly action: string }): Promise<void> {
    this.actions.push(input.action);
    return Promise.resolve();
  }
}

Deno.test("repository creation initializes Git storage and records visible repository state", async () => {
  const repository = new MemoryRepository();
  const git = new MemoryGit();
  const audit = new MemoryAudit();
  const service = new RepositoryService(repository, git, audit);
  const actor: Principal = { id: "u1", username: "platform", role: "developer" };

  const created = await service.createRepository({
    owner: "platform",
    name: "api",
    visibility: "private"
  }, actor);

  assertEquals(created.id, "platform/api");
  assertEquals(created.barePath, "/repos/platform/api.git");
  assertEquals(git.initialized.length, 1);
  assertEquals(audit.actions[0], "repository.create");

  const repositories = await service.listRepositories(actor);
  assertEquals(repositories.length, 1);
  assertEquals(repositories[0].visibility, "private");
});

Deno.test("private repository access is denied anonymously and allowed for the owner", async () => {
  const repository = new MemoryRepository();
  const service = new RepositoryService(repository, new MemoryGit(), new MemoryAudit());
  const owner: Principal = { id: "u1", username: "platform", role: "developer" };

  await service.createRepository({
    owner: "platform",
    name: "secret",
    visibility: "private"
  }, owner);

  await assertRejectsAsync(() => service.getRepository("platform", "secret", null), 403);

  const visible = await service.getRepository("platform", "secret", owner);
  assertEquals(visible.readme, "# Project");
  assertEquals(visible.branches[0], "main");
});
