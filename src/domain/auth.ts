import { ValidationError } from "./validation_error.ts";

const PASSWORD_HASH_PREFIX = "sha256";

export async function hashPassword(
  password: string,
  salt = createToken(16),
): Promise<string> {
  validatePassword(password);
  const digest = await sha256Hex(`${salt}:${password}`);
  return `${PASSWORD_HASH_PREFIX}:${salt}:${digest}`;
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [prefix, salt, digest] = storedHash.split(":");
  if (
    prefix !== PASSWORD_HASH_PREFIX || salt === undefined ||
    digest === undefined
  ) {
    return false;
  }
  const actual = await sha256Hex(`${salt}:${password}`);
  return actual === digest;
}

export function validatePassword(password: string): void {
  if (password.length < 12) {
    throw new ValidationError("password must be at least 12 characters.");
  }
}

export function createToken(byteLength = 32): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

export async function hashToken(token: string): Promise<string> {
  return await sha256Hex(token);
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(
    new Uint8Array(digest),
    (byte) => byte.toString(16).padStart(2, "0"),
  ).join("");
}
