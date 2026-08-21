import { ValidationError } from "./validation_error.ts";

export function validateRepositoryPath(value: string): string {
  const path = value.trim();

  if (path === "") {
    return "";
  }

  if (path.startsWith("/") || path.includes("\\") || path.includes("\0")) {
    throw new ValidationError("repository path must be relative.");
  }

  const segments = path.split("/");
  if (
    segments.some((segment) =>
      segment === "" || segment === "." || segment === ".."
    )
  ) {
    throw new ValidationError(
      "repository path must not contain traversal segments.",
    );
  }

  return path;
}

export function validateGitRef(value: string): string {
  const ref = value.trim();
  if (
    ref === "" || ref.includes("..") || ref.includes(":") || /\s/.test(ref) ||
    ref.includes("\\") || ref.includes("\0") || ref.startsWith("-")
  ) {
    throw new ValidationError("git ref is invalid.");
  }
  return ref;
}
