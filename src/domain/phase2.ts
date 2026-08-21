export type PullRequestState = "open" | "closed" | "merged";
export type ReviewState = "commented" | "approved" | "changes_requested";
export type WebhookDeliveryStatus = "success" | "failure";

export interface PullRequestRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly sourceBranch: string;
  readonly targetBranch: string;
  readonly state: PullRequestState;
  readonly author: string;
  readonly mergeCommitSha: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ReviewRecord {
  readonly id: string;
  readonly pullRequestId: string;
  readonly reviewer: string;
  readonly state: ReviewState;
  readonly body: string;
  readonly createdAt: string;
}

export interface WikiPageRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly slug: string;
  readonly title: string;
  readonly body: string;
  readonly author: string;
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WebhookRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly url: string;
  readonly secret: string;
  readonly events: string[];
  readonly active: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WebhookDeliveryRecord {
  readonly id: string;
  readonly webhookId: string;
  readonly event: string;
  readonly status: WebhookDeliveryStatus;
  readonly statusCode: number | null;
  readonly error: string | null;
  readonly createdAt: string;
}

export interface ReleaseRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly tagName: string;
  readonly title: string;
  readonly notes: string;
  readonly draft: boolean;
  readonly author: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 50000;
const REF_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,127}$/;
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const EVENT_PATTERN = /^[a-z][a-z0-9_.-]{0,63}$/;
const COMMIT_SHA_PATTERN = /^[0-9a-fA-F]{6,64}$/;

export function validateTitle(value: string, field = "title"): string {
  const title = value.trim();
  if (title === "") {
    throw new Response(`${field} is required.`, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Response(`${field} is too long.`, { status: 400 });
  }
  return title;
}

export function validateBody(value: string | undefined): string {
  if (value === undefined) {
    return "";
  }
  if (value.length > MAX_BODY_LENGTH) {
    throw new Response("body is too long.", { status: 400 });
  }
  return value;
}

export function validateGitBranch(value: string, field: string): string {
  const branch = value.trim();
  if (!REF_PATTERN.test(branch) || branch.includes("..")) {
    throw new Response(`${field} is invalid.`, { status: 400 });
  }
  return branch;
}

export function validatePullRequestState(value: unknown): PullRequestState {
  if (value === "open" || value === "closed" || value === "merged") {
    return value;
  }
  throw new Response("pull request state must be open, closed, or merged.", {
    status: 400,
  });
}

export function validateReviewState(value: unknown): ReviewState {
  if (
    value === "commented" || value === "approved" ||
    value === "changes_requested"
  ) {
    return value;
  }
  throw new Response(
    "review state must be commented, approved, or changes_requested.",
    { status: 400 },
  );
}

export function validateSlug(value: string): string {
  const slug = value.trim();
  if (!SLUG_PATTERN.test(slug) || slug.includes("..")) {
    throw new Response("wiki slug is invalid.", { status: 400 });
  }
  return slug;
}

export function validateWebhookUrl(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Response("webhook url is invalid.", { status: 400 });
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Response("webhook url must use http or https.", {
      status: 400,
    });
  }
  return url.toString();
}

export function validateWebhookEvents(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Response("webhook events are required.", { status: 400 });
  }
  const events = value.map((event) => {
    if (typeof event !== "string" || !EVENT_PATTERN.test(event)) {
      throw new Response("webhook event is invalid.", { status: 400 });
    }
    return event;
  });
  return [...new Set(events)].sort();
}

export function validateTagName(value: string): string {
  return validateGitBranch(value, "tagName");
}

export function validateCommitSha(value: string): string {
  const sha = value.trim();
  if (!COMMIT_SHA_PATTERN.test(sha)) {
    throw new Response("mergeCommitSha is invalid.", { status: 400 });
  }
  return sha;
}

export function parsePositiveNumber(value: string, field: string): number {
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new Response(`${field} must be a positive integer.`, {
      status: 400,
    });
  }
  return Number(value);
}

export function parseBoolean(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  if (value === true || value === false) {
    return value;
  }
  throw new Response("boolean value is invalid.", { status: 400 });
}
