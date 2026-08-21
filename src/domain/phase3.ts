import { validateRepositoryName } from "./repository.ts";

export type ProjectState = "open" | "closed";

export interface TeamRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly organizationSlug: string;
  readonly slug: string;
  readonly name: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamMemberRecord {
  readonly id: string;
  readonly teamId: string;
  readonly userId: string;
  readonly username: string;
  readonly createdAt: string;
}

export interface ProjectRecord {
  readonly id: string;
  readonly repositoryId: string;
  readonly number: number;
  readonly title: string;
  readonly body: string;
  readonly state: ProjectState;
  readonly author: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryPackageRecord {
  readonly id: string;
  readonly scope: string;
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RegistryVersionRecord {
  readonly id: string;
  readonly packageId: string;
  readonly version: string;
  readonly modulePath: string;
  readonly source: string;
  readonly checksum: string;
  readonly author: string;
  readonly createdAt: string;
}

const SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}$/;
const VERSION_PATTERN = /^v?[0-9]+[.][0-9]+[.][0-9]+(?:[-][a-zA-Z0-9._-]+)?$/;
const MODULE_PATH_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._/-]{0,160}[.]ts$/;

export function validateTeamSlug(value: string): string {
  return validateSlug(value, "team slug");
}

export function validateRegistryScope(value: string): string {
  return validateRepositoryName(value, "owner");
}

export function validateRegistryPackageName(value: string): string {
  return validateSlug(value, "registry package name");
}

export function validateProjectState(value: unknown): ProjectState {
  if (value === undefined) {
    return "open";
  }
  if (value === "open" || value === "closed") {
    return value;
  }
  throw new Response("project state must be open or closed.", { status: 400 });
}

export function validateText(
  value: string | undefined,
  field: string,
  maxLength: number,
): string {
  if (value === undefined) {
    return "";
  }
  if (value.length > maxLength) {
    throw new Response(`${field} is too long.`, { status: 400 });
  }
  return value;
}

export function validateRequiredText(
  value: string,
  field: string,
  maxLength: number,
): string {
  const text = value.trim();
  if (text === "") {
    throw new Response(`${field} is required.`, { status: 400 });
  }
  if (text.length > maxLength) {
    throw new Response(`${field} is too long.`, { status: 400 });
  }
  return text;
}

export function validateRegistryVersion(value: string): string {
  const version = value.trim();
  if (!VERSION_PATTERN.test(version)) {
    throw new Response("registry version is invalid.", { status: 400 });
  }
  return version;
}

export function validateModulePath(value: string): string {
  const modulePath = value.trim();
  if (
    !MODULE_PATH_PATTERN.test(modulePath) ||
    modulePath.includes("..") ||
    modulePath.includes("\\")
  ) {
    throw new Response("modulePath is invalid.", { status: 400 });
  }
  return modulePath;
}

function validateSlug(value: string, field: string): string {
  const slug = value.trim();
  if (!SLUG_PATTERN.test(slug) || slug.includes("..")) {
    throw new Response(`${field} is invalid.`, { status: 400 });
  }
  return slug;
}
