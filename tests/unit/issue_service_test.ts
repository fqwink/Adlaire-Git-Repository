import type { IssueRecord, IssueState } from "../../src/domain/issue.ts";
import type {
  RepositoryRecord,
  RepositoryVisibility,
} from "../../src/domain/repository.ts";
import type { Principal } from "../../src/domain/user.ts";
import { IssueService } from "../../src/services/issue_service.ts";
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

  listVisibleTo(
    username: string | null,
    isAdmin: boolean,
  ): Promise<RepositoryRecord[]> {
    if (isAdmin) {
      return Promise.resolve(this.records);
    }
    return Promise.resolve(
      this.records.filter((record) =>
        record.visibility === "public" || record.owner === username
      ),
    );
  }

  find(owner: string, name: string): Promise<RepositoryRecord | null> {
    return Promise.resolve(
      this.records.find((record) =>
        record.owner === owner && record.name === name
      ) ?? null,
    );
  }

  updateVisibility(
    owner: string,
    name: string,
    visibility: RepositoryVisibility,
    updatedAt: string,
  ): Promise<RepositoryRecord | null> {
    const index = this.records.findIndex((record) =>
      record.owner === owner && record.name === name
    );
    if (index < 0) {
      return Promise.resolve(null);
    }
    this.records[index] = { ...this.records[index], visibility, updatedAt };
    return Promise.resolve(this.records[index]);
  }

  delete(owner: string, name: string): Promise<void> {
    this.records = this.records.filter((record) =>
      record.owner !== owner || record.name !== name
    );
    return Promise.resolve();
  }

  async requireVisibleRepository(
    owner: string,
    name: string,
    actor: Principal | null,
  ): Promise<RepositoryRecord> {
    const repository = await this.find(owner, name);
    if (repository === null) {
      throw new Response("repository not found.", { status: 404 });
    }
    if (
      repository.visibility === "public" || actor?.role === "admin" ||
      actor?.username === repository.owner
    ) {
      return repository;
    }
    throw new Response("repository access denied.", { status: 403 });
  }

  async requireWritableRepository(
    owner: string,
    name: string,
    actor: Principal,
  ): Promise<RepositoryRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    if (actor.role === "admin" || actor.username === repository.owner) {
      return repository;
    }
    throw new Response("repository write access denied.", { status: 403 });
  }
}

class MemoryIssue {
  records: IssueRecord[] = [];

  nextNumber(repositoryId: string): Promise<number> {
    const numbers = this.records
      .filter((record) => record.repositoryId === repositoryId)
      .map((record) => record.number);
    return Promise.resolve(Math.max(0, ...numbers) + 1);
  }

  create(record: IssueRecord): Promise<IssueRecord> {
    this.records.push(record);
    return Promise.resolve(record);
  }

  list(repositoryId: string, state?: IssueState): Promise<IssueRecord[]> {
    return Promise.resolve(
      this.records
        .filter((record) =>
          record.repositoryId === repositoryId &&
          (state === undefined || record.state === state)
        )
        .sort((left, right) => right.number - left.number),
    );
  }

  find(repositoryId: string, number: number): Promise<IssueRecord | null> {
    return Promise.resolve(
      this.records.find((record) =>
        record.repositoryId === repositoryId && record.number === number
      ) ?? null,
    );
  }

  update(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: IssueState;
      readonly updatedAt: string;
    },
  ): Promise<IssueRecord | null> {
    const index = this.records.findIndex((record) =>
      record.repositoryId === repositoryId && record.number === number
    );
    if (index < 0) {
      return Promise.resolve(null);
    }
    this.records[index] = { ...this.records[index], ...fields };
    return Promise.resolve(this.records[index]);
  }
}

class MemoryAudit {
  actions: string[] = [];

  record(input: { readonly action: string }): Promise<void> {
    this.actions.push(input.action);
    return Promise.resolve();
  }
}

Deno.test("authenticated users create and list repository issues", async () => {
  const repositories = new MemoryRepository();
  const issues = new MemoryIssue();
  const audit = new MemoryAudit();
  const service = new IssueService(repositories, issues, audit);
  const actor = principal("platform");
  repositories.records.push(repository("platform", "api", "private"));

  const created = await service.createIssue("platform", "api", {
    title: "Add issue tracking",
    body: "Track repository work.",
  }, actor);

  assertEquals(created.id, "platform/api#1");
  assertEquals(created.number, 1);
  assertEquals(created.state, "open");
  assertEquals(created.author, "platform");
  assertEquals(audit.actions[0], "issue.create");

  const listed = await service.listIssues("platform", "api", actor);
  assertEquals(listed.length, 1);
  assertEquals(listed[0].title, "Add issue tracking");
});

Deno.test("private repository issues are hidden from anonymous users", async () => {
  const repositories = new MemoryRepository();
  const service = new IssueService(
    repositories,
    new MemoryIssue(),
    new MemoryAudit(),
  );
  repositories.records.push(repository("platform", "secret", "private"));

  await assertRejectsAsync(
    () => service.listIssues("platform", "secret", null),
    403,
  );
});

Deno.test("issue authors can close issues while other developers cannot", async () => {
  const repositories = new MemoryRepository();
  const issues = new MemoryIssue();
  const service = new IssueService(repositories, issues, new MemoryAudit());
  repositories.records.push(repository("platform", "api", "public"));

  await service.createIssue("platform", "api", {
    title: "Bug",
  }, principal("alice"));

  await assertRejectsAsync(
    () =>
      service.updateIssue("platform", "api", 1, {
        state: "closed",
      }, principal("bob")),
    403,
  );

  const closed = await service.updateIssue("platform", "api", 1, {
    state: "closed",
  }, principal("alice"));
  assertEquals(closed.state, "closed");
});

function repository(
  owner: string,
  name: string,
  visibility: RepositoryVisibility,
): RepositoryRecord {
  const now = "2026-08-21T00:00:00.000Z";
  return {
    id: `${owner}/${name}`,
    owner,
    name,
    visibility,
    barePath: `/repos/${owner}/${name}.git`,
    createdAt: now,
    updatedAt: now,
  };
}

function principal(username: string): Principal {
  return {
    id: username,
    username,
    role: "developer",
  };
}
