import type { RepositoryRecord } from "../domain/repository.ts";
import { validateRepositoryName } from "../domain/repository.ts";
import type { Principal } from "../domain/user.ts";
import {
  parseBoolean,
  type PullRequestRecord,
  type PullRequestState,
  type ReleaseRecord,
  type ReviewRecord,
  type ReviewState,
  validateBody,
  validateCommitSha,
  validateGitBranch,
  validatePullRequestState,
  validateReviewState,
  validateSlug,
  validateTagName,
  validateTitle,
  validateWebhookEvents,
  validateWebhookUrl,
  type WebhookDeliveryRecord,
  type WebhookRecord,
  type WikiPageRecord,
} from "../domain/phase2.ts";
import type { AuditSink } from "./audit_service.ts";
import type { RepositoryStore } from "./repository_service.ts";

export interface Phase2Store {
  nextPullRequestNumber(repositoryId: string): Promise<number>;
  createPullRequest(record: PullRequestRecord): Promise<PullRequestRecord>;
  listPullRequests(
    repositoryId: string,
    state?: PullRequestState,
  ): Promise<PullRequestRecord[]>;
  findPullRequest(
    repositoryId: string,
    number: number,
  ): Promise<PullRequestRecord | null>;
  updatePullRequest(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: PullRequestState;
      readonly mergeCommitSha: string | null;
      readonly updatedAt: string;
    },
  ): Promise<PullRequestRecord | null>;
  createReview(record: ReviewRecord): Promise<ReviewRecord>;
  listReviews(pullRequestId: string): Promise<ReviewRecord[]>;
  upsertWikiPage(record: WikiPageRecord): Promise<WikiPageRecord>;
  findWikiPage(
    repositoryId: string,
    slug: string,
  ): Promise<WikiPageRecord | null>;
  listWikiPages(repositoryId: string): Promise<WikiPageRecord[]>;
  createWebhook(record: WebhookRecord): Promise<WebhookRecord>;
  listWebhooks(repositoryId: string): Promise<WebhookRecord[]>;
  findWebhook(id: string): Promise<WebhookRecord | null>;
  recordWebhookDelivery(
    record: WebhookDeliveryRecord,
  ): Promise<WebhookDeliveryRecord>;
  createRelease(record: ReleaseRecord): Promise<ReleaseRecord>;
  listReleases(repositoryId: string): Promise<ReleaseRecord[]>;
  findRelease(
    repositoryId: string,
    tagName: string,
  ): Promise<ReleaseRecord | null>;
}

export class Phase2Service {
  constructor(
    private readonly repositories: RepositoryStore,
    private readonly store: Phase2Store,
    private readonly audit: AuditSink,
  ) {}

  async createPullRequest(owner: string, name: string, input: {
    readonly title: string;
    readonly body?: string;
    readonly sourceBranch: string;
    readonly targetBranch: string;
  }, actor: Principal): Promise<PullRequestRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const now = new Date().toISOString();
    const number = await this.store.nextPullRequestNumber(repository.id);
    const pullRequest = await this.store.createPullRequest({
      id: `${repository.id}!${number}`,
      repositoryId: repository.id,
      number,
      title: validateTitle(input.title),
      body: validateBody(input.body),
      sourceBranch: validateGitBranch(input.sourceBranch, "sourceBranch"),
      targetBranch: validateGitBranch(input.targetBranch, "targetBranch"),
      state: "open",
      author: actor.username,
      mergeCommitSha: null,
      createdAt: now,
      updatedAt: now,
    });
    await this.record(
      actor,
      "pull_request.create",
      "pull_request",
      pullRequest.id,
    );
    return pullRequest;
  }

  async listPullRequests(
    owner: string,
    name: string,
    actor: Principal | null,
    state?: PullRequestState,
  ): Promise<PullRequestRecord[]> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    return await this.store.listPullRequests(repository.id, state);
  }

  async getPullRequest(
    owner: string,
    name: string,
    number: number,
    actor: Principal | null,
  ): Promise<PullRequestRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    return await this.requirePullRequest(repository, number);
  }

  async updatePullRequest(owner: string, name: string, number: number, input: {
    readonly title?: string;
    readonly body?: string;
    readonly state?: PullRequestState;
    readonly mergeCommitSha?: string | null;
  }, actor: Principal): Promise<PullRequestRecord> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    const current = await this.requirePullRequest(repository, number);
    const nextState = input.state === undefined
      ? current.state
      : validatePullRequestState(input.state);
    const nextMergeCommitSha = input.mergeCommitSha === undefined
      ? current.mergeCommitSha
      : input.mergeCommitSha === null
      ? null
      : validateCommitSha(input.mergeCommitSha);
    if (nextState === "merged" && nextMergeCommitSha === null) {
      throw new Response("mergeCommitSha is required when merging.", {
        status: 400,
      });
    }

    const updated = await this.store.updatePullRequest(repository.id, number, {
      title: input.title === undefined
        ? current.title
        : validateTitle(input.title),
      body: input.body === undefined ? current.body : validateBody(input.body),
      state: nextState,
      mergeCommitSha: nextMergeCommitSha,
      updatedAt: new Date().toISOString(),
    });
    if (updated === null) {
      throw new Response("pull request not found.", { status: 404 });
    }
    await this.record(actor, "pull_request.update", "pull_request", updated.id);
    return updated;
  }

  async createReview(owner: string, name: string, number: number, input: {
    readonly state: ReviewState;
    readonly body?: string;
  }, actor: Principal): Promise<ReviewRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const pullRequest = await this.requirePullRequest(repository, number);
    const review = await this.store.createReview({
      id: crypto.randomUUID(),
      pullRequestId: pullRequest.id,
      reviewer: actor.username,
      state: validateReviewState(input.state),
      body: validateBody(input.body),
      createdAt: new Date().toISOString(),
    });
    await this.record(actor, "code_review.create", "code_review", review.id);
    return review;
  }

  async listReviews(
    owner: string,
    name: string,
    number: number,
    actor: Principal | null,
  ): Promise<ReviewRecord[]> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const pullRequest = await this.requirePullRequest(repository, number);
    return await this.store.listReviews(pullRequest.id);
  }

  async upsertWikiPage(owner: string, name: string, input: {
    readonly slug: string;
    readonly title: string;
    readonly body: string;
  }, actor: Principal): Promise<WikiPageRecord> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    const slug = validateSlug(input.slug);
    const now = new Date().toISOString();
    const page = await this.store.upsertWikiPage({
      id: `${repository.id}/wiki/${slug}`,
      repositoryId: repository.id,
      slug,
      title: validateTitle(input.title),
      body: validateBody(input.body),
      author: actor.username,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    await this.record(actor, "wiki.upsert", "wiki_page", page.id);
    return page;
  }

  async listWikiPages(
    owner: string,
    name: string,
    actor: Principal | null,
  ): Promise<WikiPageRecord[]> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    return await this.store.listWikiPages(repository.id);
  }

  async getWikiPage(
    owner: string,
    name: string,
    slug: string,
    actor: Principal | null,
  ): Promise<WikiPageRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const page = await this.store.findWikiPage(
      repository.id,
      validateSlug(slug),
    );
    if (page === null) {
      throw new Response("wiki page not found.", { status: 404 });
    }
    return page;
  }

  async createWebhook(owner: string, name: string, input: {
    readonly url: string;
    readonly secret?: string;
    readonly events: unknown;
    readonly active?: unknown;
  }, actor: Principal): Promise<WebhookRecord> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    const now = new Date().toISOString();
    const webhook = await this.store.createWebhook({
      id: crypto.randomUUID(),
      repositoryId: repository.id,
      url: validateWebhookUrl(input.url),
      secret: input.secret === undefined || input.secret.trim() === ""
        ? crypto.randomUUID()
        : input.secret,
      events: validateWebhookEvents(input.events),
      active: parseBoolean(input.active, true),
      createdAt: now,
      updatedAt: now,
    });
    await this.record(actor, "webhook.create", "webhook", webhook.id);
    return webhook;
  }

  async listWebhooks(
    owner: string,
    name: string,
    actor: Principal,
  ): Promise<WebhookRecord[]> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    return await this.store.listWebhooks(repository.id);
  }

  async recordWebhookPing(
    webhookId: string,
    actor: Principal,
  ): Promise<WebhookDeliveryRecord> {
    const webhook = await this.store.findWebhook(webhookId);
    if (webhook === null) {
      throw new Response("webhook not found.", { status: 404 });
    }
    await this.requireRepositoryByIdForWrite(webhook.repositoryId, actor);
    const sent = await sendWebhookPing(webhook);
    const delivery = await this.store.recordWebhookDelivery({
      id: crypto.randomUUID(),
      webhookId: webhook.id,
      event: "ping",
      status: sent.ok ? "success" : "failure",
      statusCode: sent.statusCode,
      error: sent.error,
      createdAt: new Date().toISOString(),
    });
    await this.record(actor, "webhook.ping", "webhook", webhook.id);
    return delivery;
  }

  async createRelease(owner: string, name: string, input: {
    readonly tagName: string;
    readonly title: string;
    readonly notes?: string;
    readonly draft?: unknown;
  }, actor: Principal): Promise<ReleaseRecord> {
    const repository = await this.requireWritableRepository(owner, name, actor);
    const tagName = validateTagName(input.tagName);
    if (await this.store.findRelease(repository.id, tagName) !== null) {
      throw new Response("release already exists.", { status: 409 });
    }
    const now = new Date().toISOString();
    const release = await this.store.createRelease({
      id: `${repository.id}@${tagName}`,
      repositoryId: repository.id,
      tagName,
      title: validateTitle(input.title),
      notes: validateBody(input.notes),
      draft: parseBoolean(input.draft, false),
      author: actor.username,
      createdAt: now,
      updatedAt: now,
    });
    await this.record(actor, "release.create", "release", release.id);
    return release;
  }

  async listReleases(
    owner: string,
    name: string,
    actor: Principal | null,
  ): Promise<ReleaseRecord[]> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    return await this.store.listReleases(repository.id);
  }

  async getRelease(
    owner: string,
    name: string,
    tagName: string,
    actor: Principal | null,
  ): Promise<ReleaseRecord> {
    const repository = await this.requireVisibleRepository(owner, name, actor);
    const release = await this.store.findRelease(
      repository.id,
      validateTagName(tagName),
    );
    if (release === null) {
      throw new Response("release not found.", { status: 404 });
    }
    return release;
  }

  private async requirePullRequest(
    repository: RepositoryRecord,
    number: number,
  ): Promise<PullRequestRecord> {
    const pullRequest = await this.store.findPullRequest(repository.id, number);
    if (pullRequest === null) {
      throw new Response("pull request not found.", { status: 404 });
    }
    return pullRequest;
  }

  private async requireRepositoryByIdForWrite(
    repositoryId: string,
    actor: Principal,
  ): Promise<RepositoryRecord> {
    const separator = repositoryId.indexOf("/");
    return await this.requireWritableRepository(
      repositoryId.slice(0, separator),
      repositoryId.slice(separator + 1),
      actor,
    );
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

  private async requireWritableRepository(
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

  private async record(
    actor: Principal,
    action: string,
    targetType: string,
    targetId: string,
  ): Promise<void> {
    await this.audit.record({
      actor: actor.username,
      action,
      targetType,
      targetId,
    });
  }
}

async function sendWebhookPing(webhook: WebhookRecord): Promise<{
  readonly ok: boolean;
  readonly statusCode: number | null;
  readonly error: string | null;
}> {
  const body = JSON.stringify({
    event: "ping",
    webhookId: webhook.id,
    repositoryId: webhook.repositoryId,
    deliveredAt: new Date().toISOString(),
  });
  const signature = await createSignature(webhook.secret, body);
  try {
    const response = await fetch(webhook.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-adlaire-event": "ping",
        "x-adlaire-signature-256": `sha256=${signature}`,
      },
      body,
    });
    return {
      ok: response.ok,
      statusCode: response.status,
      error: response.ok ? null : `webhook responded with ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      statusCode: null,
      error: error instanceof Error ? error.message : "webhook delivery failed",
    };
  }
}

async function createSignature(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(body),
  );
  return [...new Uint8Array(signature)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
