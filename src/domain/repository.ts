import { ValidationError } from "./validation_error.ts";

export type RepositoryVisibility = "public" | "private";

export interface RepositoryInput {
  readonly owner: string;
  readonly name: string;
  readonly visibility: RepositoryVisibility;
}

export interface RepositoryRecord extends RepositoryInput {
  readonly id: string;
  readonly barePath: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RepositoryDetail extends RepositoryRecord {
  readonly branches: string[];
  readonly tags: string[];
  readonly readme: string | null;
}

const NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}$/;

export function validateRepositoryName(
  value: string,
  field: "owner" | "name",
): string {
  const name = value.trim();

  if (!NAME_PATTERN.test(name)) {
    throw new ValidationError(
      `${field} must start with an alphanumeric character and contain only alphanumeric characters, dots, underscores, or hyphens.`,
    );
  }

  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    throw new ValidationError(
      `${field} must not contain path traversal characters.`,
    );
  }

  if (name.endsWith(".git")) {
    throw new ValidationError(`${field} must not include the .git suffix.`);
  }

  return name;
}

export function createRepositoryId(owner: string, name: string): string {
  return `${owner}/${name}`;
}
