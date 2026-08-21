import {
  createIssueId,
  type IssueInput,
  type IssueRecord,
  type IssueState,
  type IssueUpdateInput,
  validateIssueBody,
  validateIssueState,
  validateIssueTitle,
} from "../domain/issue.ts";
import type { RepositoryRecord } from "../domain/repository.ts";
import { validateRepositoryName } from "../domain/repository.ts";
import type { Principal } from "../domain/user.ts";
import type { AuditSink } from "./audit_service.ts";
import type { RepositoryStore } from "./repository_service.ts";

export interface IssueStore {
  nextNumber(repositoryId: string): Promise<number>;
  create(record: IssueRecord): Promise<IssueRecord>;
  list(repositoryId: string, state?: IssueState): Promise<IssueRecord[]>;
  find(repositoryId: string, number: number): Promise<IssueRecord | null>;
  update(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: IssueState;
      readonly updatedAt: string;
    },
  ): Promise<IssueRecord | null>;
}

export class IssueService {
  constructor(
    private readonly repositories: RepositoryStore,
    private readonly issues: IssueStore,
    private readonly audit: AuditSink,
  ) {}

  async createIssue(
    owner: string,
    name: string,
    input: IssueInput,
    actor: Principal,
  ): Promise<IssueRecord> {
    const repository = await this.requireVisibleRepository(
      owner,
      name,
      actor,
    );
    const title = validateIssueTitle(input.title);
    const body = validateIssueBody(input.body);
    const now = new Date().toISOString();
    const number = await this.issues.nextNumber(repository.id);
    const created = await this.issues.create({
      id: createIssueId(repository.owner, repository.name, number),
      repositoryId: repository.id,
      number,
      title,
      body,
      state: "open",
      author: actor.username,
      createdAt: now,
      updatedAt: now,
    });

    await this.audit.record({
      actor: actor.username,
      action: "issue.create",
      targetType: "issue",
      targetId: created.id,
    });

    return created;
  }

  async listIssues(
    owner: string,
    name: string,
    actor: Principal | null,
    state?: IssueState,
  ): Promise<IssueRecord[]> {
    const repository = await this.requireVisibleRepository(
      owner,
      name,
      actor,
    );
    return await this.issues.list(repository.id, state);
  }

  async getIssue(
    owner: string,
    name: string,
    number: number,
    actor: Principal | null,
  ): Promise<IssueRecord> {
    const repository = await this.requireVisibleRepository(
      owner,
      name,
      actor,
    );
    return await this.requireIssue(repository, number);
  }

  async updateIssue(
    owner: string,
    name: string,
    number: number,
    input: IssueUpdateInput,
    actor: Principal,
  ): Promise<IssueRecord> {
    const repository = await this.requireVisibleRepository(
      owner,
      name,
      actor,
    );
    const current = await this.requireIssue(repository, number);
    if (
      actor.role !== "admin" && actor.username !== repository.owner &&
      actor.username !== current.author
    ) {
      throw new Response("issue write access denied.", { status: 403 });
    }

    const updated = await this.issues.update(repository.id, number, {
      title: input.title === undefined
        ? current.title
        : validateIssueTitle(input.title),
      body: input.body === undefined
        ? current.body
        : validateIssueBody(input.body),
      state: input.state === undefined
        ? current.state
        : validateIssueState(input.state),
      updatedAt: new Date().toISOString(),
    });
    if (updated === null) {
      throw new Response("issue not found.", { status: 404 });
    }

    await this.audit.record({
      actor: actor.username,
      action: "issue.update",
      targetType: "issue",
      targetId: updated.id,
    });

    return updated;
  }

  private async requireIssue(
    repository: RepositoryRecord,
    number: number,
  ): Promise<IssueRecord> {
    const issue = await this.issues.find(repository.id, number);
    if (issue === null) {
      throw new Response("issue not found.", { status: 404 });
    }
    return issue;
  }

  private async requireVisibleRepository(
    owner: string,
    name: string,
    actor: Principal | null,
  ): Promise<RepositoryRecord> {
    const safeOwner = validateRepositoryName(owner, "owner");
    const safeName = validateRepositoryName(name, "name");
    const repository = await this.repositories.find(safeOwner, safeName);
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
}
