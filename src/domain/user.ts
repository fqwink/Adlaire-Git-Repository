export type UserRole = "admin" | "developer";

export interface UserRecord {
  readonly id: string;
  readonly username: string;
  readonly passwordHash: string;
  readonly role: UserRole;
  readonly createdAt: string;
}

export interface PublicUser {
  readonly id: string;
  readonly username: string;
  readonly role: UserRole;
  readonly createdAt: string;
}

export interface Principal {
  readonly id: string;
  readonly username: string;
  readonly role: UserRole;
}

const USERNAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,62}$/;

export function validateUsername(value: string): string {
  const username = value.trim();
  if (!USERNAME_PATTERN.test(username)) {
    throw new Error("username must be 3-63 characters and contain only alphanumeric characters, dots, underscores, or hyphens.");
  }
  if (username.includes("..")) {
    throw new Error("username must not contain path traversal patterns.");
  }
  return username;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt
  };
}

export function toPrincipal(user: UserRecord): Principal {
  return {
    id: user.id,
    username: user.username,
    role: user.role
  };
}
