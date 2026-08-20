import type { RepositoryRecord } from "../../src/domain/repository.ts";
import { RepositoryService } from "../../src/services/repository_service.ts";
import { assertEquals } from "../support/assert.ts";

class MemoryRepository {
  records: RepositoryRecord[] = [];

  create(record: RepositoryRecord): Promise<RepositoryRecord> {
    this.records.push(record);
    return Promise.resolve(record);
  }

  list(): Promise<RepositoryRecord[]> {
    return Promise.resolve(this.records);
  }
}

class MemoryGit {
  initialized: string[] = [];

  initializeBareRepository(owner: string, name: string): Promise<string> {
    const path = `/repos/${owner}/${name}.git`;
    this.initialized.push(path);
    return Promise.resolve(path);
  }
}

Deno.test("repository creation initializes Git storage and records visible repository state", async () => {
  const repository = new MemoryRepository();
  const git = new MemoryGit();
  const service = new RepositoryService(repository, git);

  const created = await service.createRepository({
    owner: "platform",
    name: "api",
    visibility: "private"
  });

  assertEquals(created.id, "platform/api");
  assertEquals(created.barePath, "/repos/platform/api.git");
  assertEquals(git.initialized.length, 1);

  const repositories = await service.listRepositories();
  assertEquals(repositories.length, 1);
  assertEquals(repositories[0].visibility, "private");
});
