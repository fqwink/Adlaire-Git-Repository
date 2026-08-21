import { createRepositoryId } from "./repository.ts";

export type IssueState = "open" | "closed";

export interface IssueInput {
  readonly title: string;
  readonly body?: string;
}

export interface IssueUpdateInput {
  readonly title?: string;
  readonly body?: string;
  readonly state?: IssueState;
}

export interface IssueRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: IssueState;
  readonly author: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

const MAX_TITLE_LENGTH = 200;
const MAX_BODY_LENGTH = 20000;

export function createIssueId(
  owner: string,
  name: string,
  number: number,
): string {
  return `${createRepositoryId(owner, name)}#${number}`;
}

export function validateIssueTitle(value: string): string {
  const title = value.trim();
  if (title === "") {
    throw new Response("issue title is required.", { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    throw new Response("issue title is too long.", { status: 400 });
  }
  return title;
}

export function validateIssueBody(value: string | undefined): string {
  if (value === undefined) {
    return "";
  }
  if (value.length > MAX_BODY_LENGTH) {
    throw new Response("issue body is too long.", { status: 400 });
  }
  return value;
}

export function validateIssueState(value: unknown): IssueState {
  if (value === "open" || value === "closed") {
    return value;
  }
  throw new Response("issue state must be open or closed.", { status: 400 });
}

export function parseIssueNumber(value: string): number {
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new Response("issue number must be a positive integer.", {
      status: 400,
    });
  }
  return Number(value);
}
