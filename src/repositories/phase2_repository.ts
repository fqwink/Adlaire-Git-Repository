import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type {
  PullRequestRecord,
  PullRequestState,
  ReleaseRecord,
  ReviewRecord,
  ReviewState,
  WebhookDeliveryRecord,
  WebhookDeliveryStatus,
  WebhookRecord,
  WikiPageRecord,
} from "../domain/phase2.ts";

type DbBoolean = 0 | 1;

interface PullRequestRow {
  id: string;
  repository_id: string;
  number: number;
  title: string;
  body: string;
  source_branch: string;
  target_branch: string;
  state: PullRequestState;
  author: string;
  merge_commit_sha: string | null;
  created_at: string;
  updated_at: string;
}

interface ReviewRow {
  id: string;
  pull_request_id: string;
  reviewer: string;
  state: ReviewState;
  body: string;
  created_at: string;
}

interface WikiPageRow {
  id: string;
  repository_id: string;
  slug: string;
  title: string;
  body: string;
  author: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface WebhookRow {
  id: string;
  repository_id: string;
  url: string;
  secret: string;
  events: string;
  active: DbBoolean;
  created_at: string;
  updated_at: string;
}

interface WebhookDeliveryRow {
  id: string;
  webhook_id: string;
  event: string;
  status: WebhookDeliveryStatus;
  status_code: number | null;
  error: string | null;
  created_at: string;
}

interface ReleaseRow {
  id: string;
  repository_id: string;
  tag_name: string;
  title: string;
  notes: string;
  draft: DbBoolean;
  author: string;
  created_at: string;
  updated_at: string;
}

export class Phase2Repository {
  constructor(private readonly database: DatabaseGateway) {}

  async nextPullRequestNumber(repositoryId: string): Promise<number> {
    const rows = await this.database.query<{ next_number: number }>(`
      SELECT COALESCE(MAX(number), 0) + 1 AS next_number
      FROM pull_requests
      WHERE repository_id = ${quoteSqlText(repositoryId)};
    `);
    return rows[0]?.next_number ?? 1;
  }

  async createPullRequest(
    record: PullRequestRecord,
  ): Promise<PullRequestRecord> {
    await this.database.execute(`
      INSERT INTO pull_requests (id, repository_id, number, title, body, source_branch, target_branch, state, author, merge_commit_sha, created_at, updated_at)
      VALUES (${quoteSqlText(record.id)}, ${
      quoteSqlText(record.repositoryId)
    }, ${record.number}, ${quoteSqlText(record.title)}, ${
      quoteSqlText(record.body)
    }, ${quoteSqlText(record.sourceBranch)}, ${
      quoteSqlText(record.targetBranch)
    }, ${quoteSqlText(record.state)}, ${quoteSqlText(record.author)}, ${
      nullable(record.mergeCommitSha)
    }, ${quoteSqlText(record.createdAt)}, ${quoteSqlText(record.updatedAt)});
    `);
    return record;
  }

  async listPullRequests(
    repositoryId: string,
    state?: PullRequestState,
  ): Promise<PullRequestRecord[]> {
    const filter = state === undefined
      ? ""
      : `AND state = ${quoteSqlText(state)}`;
    const rows = await this.database.query<PullRequestRow>(`
      SELECT id, repository_id, number, title, body, source_branch, target_branch, state, author, merge_commit_sha, created_at, updated_at
      FROM pull_requests
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        ${filter}
      ORDER BY number DESC;
    `);
    return rows.map(toPullRequest);
  }

  async findPullRequest(
    repositoryId: string,
    number: number,
  ): Promise<PullRequestRecord | null> {
    const rows = await this.database.query<PullRequestRow>(`
      SELECT id, repository_id, number, title, body, source_branch, target_branch, state, author, merge_commit_sha, created_at, updated_at
      FROM pull_requests
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toPullRequest(rows[0]);
  }

  async updatePullRequest(
    repositoryId: string,
    number: number,
    fields: {
      readonly title: string;
      readonly body: string;
      readonly state: PullRequestState;
      readonly mergeCommitSha: string | null;
      readonly updatedAt: string;
    },
  ): Promise<PullRequestRecord | null> {
    await this.database.execute(`
      UPDATE pull_requests
      SET title = ${quoteSqlText(fields.title)},
          body = ${quoteSqlText(fields.body)},
          state = ${quoteSqlText(fields.state)},
          merge_commit_sha = ${nullable(fields.mergeCommitSha)},
          updated_at = ${quoteSqlText(fields.updatedAt)}
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND number = ${number};
    `);
    return await this.findPullRequest(repositoryId, number);
  }

  async createReview(record: ReviewRecord): Promise<ReviewRecord> {
    await this.database.execute(`
      INSERT INTO code_reviews (id, pull_request_id, reviewer, state, body, created_at)
      VALUES (${quoteSqlText(record.id)}, ${
      quoteSqlText(record.pullRequestId)
    }, ${quoteSqlText(record.reviewer)}, ${quoteSqlText(record.state)}, ${
      quoteSqlText(record.body)
    }, ${quoteSqlText(record.createdAt)});
    `);
    return record;
  }

  async listReviews(pullRequestId: string): Promise<ReviewRecord[]> {
    const rows = await this.database.query<ReviewRow>(`
      SELECT id, pull_request_id, reviewer, state, body, created_at
      FROM code_reviews
      WHERE pull_request_id = ${quoteSqlText(pullRequestId)}
      ORDER BY created_at ASC;
    `);
    return rows.map(toReview);
  }

  async upsertWikiPage(record: WikiPageRecord): Promise<WikiPageRecord> {
    const current = await this.findWikiPage(record.repositoryId, record.slug);
    if (current === null) {
      await this.database.execute(`
        INSERT INTO wiki_pages (id, repository_id, slug, title, body, author, version, created_at, updated_at)
        VALUES (${quoteSqlText(record.id)}, ${
        quoteSqlText(record.repositoryId)
      }, ${quoteSqlText(record.slug)}, ${quoteSqlText(record.title)}, ${
        quoteSqlText(record.body)
      }, ${quoteSqlText(record.author)}, ${record.version}, ${
        quoteSqlText(record.createdAt)
      }, ${quoteSqlText(record.updatedAt)});
      `);
      return record;
    }

    const nextVersion = current.version + 1;
    await this.database.execute(`
      UPDATE wiki_pages
      SET title = ${quoteSqlText(record.title)},
          body = ${quoteSqlText(record.body)},
          author = ${quoteSqlText(record.author)},
          version = ${nextVersion},
          updated_at = ${quoteSqlText(record.updatedAt)}
      WHERE repository_id = ${quoteSqlText(record.repositoryId)}
        AND slug = ${quoteSqlText(record.slug)};
    `);
    return { ...record, version: nextVersion, createdAt: current.createdAt };
  }

  async findWikiPage(
    repositoryId: string,
    slug: string,
  ): Promise<WikiPageRecord | null> {
    const rows = await this.database.query<WikiPageRow>(`
      SELECT id, repository_id, slug, title, body, author, version, created_at, updated_at
      FROM wiki_pages
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND slug = ${quoteSqlText(slug)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toWikiPage(rows[0]);
  }

  async listWikiPages(repositoryId: string): Promise<WikiPageRecord[]> {
    const rows = await this.database.query<WikiPageRow>(`
      SELECT id, repository_id, slug, title, body, author, version, created_at, updated_at
      FROM wiki_pages
      WHERE repository_id = ${quoteSqlText(repositoryId)}
      ORDER BY slug ASC;
    `);
    return rows.map(toWikiPage);
  }

  async createWebhook(record: WebhookRecord): Promise<WebhookRecord> {
    await this.database.execute(`
      INSERT INTO webhooks (id, repository_id, url, secret, events, active, created_at, updated_at)
      VALUES (${quoteSqlText(record.id)}, ${
      quoteSqlText(record.repositoryId)
    }, ${quoteSqlText(record.url)}, ${quoteSqlText(record.secret)}, ${
      quoteSqlText(record.events.join(","))
    }, ${record.active ? 1 : 0}, ${quoteSqlText(record.createdAt)}, ${
      quoteSqlText(record.updatedAt)
    });
    `);
    return record;
  }

  async listWebhooks(repositoryId: string): Promise<WebhookRecord[]> {
    const rows = await this.database.query<WebhookRow>(`
      SELECT id, repository_id, url, secret, events, active, created_at, updated_at
      FROM webhooks
      WHERE repository_id = ${quoteSqlText(repositoryId)}
      ORDER BY created_at ASC;
    `);
    return rows.map(toWebhook);
  }

  async findWebhook(id: string): Promise<WebhookRecord | null> {
    const rows = await this.database.query<WebhookRow>(`
      SELECT id, repository_id, url, secret, events, active, created_at, updated_at
      FROM webhooks
      WHERE id = ${quoteSqlText(id)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toWebhook(rows[0]);
  }

  async recordWebhookDelivery(
    record: WebhookDeliveryRecord,
  ): Promise<WebhookDeliveryRecord> {
    await this.database.execute(`
      INSERT INTO webhook_deliveries (id, webhook_id, event, status, status_code, error, created_at)
      VALUES (${quoteSqlText(record.id)}, ${quoteSqlText(record.webhookId)}, ${
      quoteSqlText(record.event)
    }, ${quoteSqlText(record.status)}, ${record.statusCode ?? "NULL"}, ${
      nullable(record.error)
    }, ${quoteSqlText(record.createdAt)});
    `);
    return record;
  }

  async createRelease(record: ReleaseRecord): Promise<ReleaseRecord> {
    await this.database.execute(`
      INSERT INTO releases (id, repository_id, tag_name, title, notes, draft, author, created_at, updated_at)
      VALUES (${quoteSqlText(record.id)}, ${
      quoteSqlText(record.repositoryId)
    }, ${quoteSqlText(record.tagName)}, ${quoteSqlText(record.title)}, ${
      quoteSqlText(record.notes)
    }, ${record.draft ? 1 : 0}, ${quoteSqlText(record.author)}, ${
      quoteSqlText(record.createdAt)
    }, ${quoteSqlText(record.updatedAt)});
    `);
    return record;
  }

  async listReleases(repositoryId: string): Promise<ReleaseRecord[]> {
    const rows = await this.database.query<ReleaseRow>(`
      SELECT id, repository_id, tag_name, title, notes, draft, author, created_at, updated_at
      FROM releases
      WHERE repository_id = ${quoteSqlText(repositoryId)}
      ORDER BY created_at DESC;
    `);
    return rows.map(toRelease);
  }

  async findRelease(
    repositoryId: string,
    tagName: string,
  ): Promise<ReleaseRecord | null> {
    const rows = await this.database.query<ReleaseRow>(`
      SELECT id, repository_id, tag_name, title, notes, draft, author, created_at, updated_at
      FROM releases
      WHERE repository_id = ${quoteSqlText(repositoryId)}
        AND tag_name = ${quoteSqlText(tagName)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toRelease(rows[0]);
  }
}

function nullable(value: string | null): string {
  return value === null ? "NULL" : quoteSqlText(value);
}

function toPullRequest(row: PullRequestRow): PullRequestRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    number: row.number,
    title: row.title,
    body: row.body,
    sourceBranch: row.source_branch,
    targetBranch: row.target_branch,
    state: row.state,
    author: row.author,
    mergeCommitSha: row.merge_commit_sha,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toReview(row: ReviewRow): ReviewRecord {
  return {
    id: row.id,
    pullRequestId: row.pull_request_id,
    reviewer: row.reviewer,
    state: row.state,
    body: row.body,
    createdAt: row.created_at,
  };
}

function toWikiPage(row: WikiPageRow): WikiPageRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    slug: row.slug,
    title: row.title,
    body: row.body,
    author: row.author,
    version: row.version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toWebhook(row: WebhookRow): WebhookRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    url: row.url,
    secret: row.secret,
    events: row.events.split(",").filter(Boolean),
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRelease(row: ReleaseRow): ReleaseRecord {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    tagName: row.tag_name,
    title: row.title,
    notes: row.notes,
    draft: row.draft === 1,
    author: row.author,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
