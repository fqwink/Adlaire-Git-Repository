export type OrganizationMemberRole = "owner" | "member";

export interface OrganizationInput {
  readonly slug: string;
  readonly name: string;
}

export interface OrganizationRecord extends OrganizationInput {
  readonly id: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface OrganizationMemberRecord {
  readonly id: string;
  readonly organizationId: string;
  readonly userId: string;
  readonly username: string;
  readonly role: OrganizationMemberRole;
  readonly createdAt: string;
}

const ORGANIZATION_SLUG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._-]{2,62}$/;

export function validateOrganizationSlug(value: string): string {
  const slug = value.trim();
  if (!ORGANIZATION_SLUG_PATTERN.test(slug)) {
    throw new Error(
      "organization slug must be 3-63 characters and contain only alphanumeric characters, dots, underscores, or hyphens.",
    );
  }
  if (slug.includes("..") || slug.includes("/") || slug.includes("\\")) {
    throw new Error(
      "organization slug must not contain path traversal characters.",
    );
  }
  if (slug.endsWith(".git")) {
    throw new Error("organization slug must not include the .git suffix.");
  }
  return slug;
}

export function validateOrganizationName(value: string): string {
  const name = value.trim();
  if (name === "") {
    throw new Response("organization name is required.", { status: 400 });
  }
  if (name.length > 120) {
    throw new Response("organization name must be 120 characters or less.", {
      status: 400,
    });
  }
  return name;
}

export function validateOrganizationMemberRole(
  value: unknown,
): OrganizationMemberRole {
  if (value === undefined) {
    return "member";
  }
  if (value === "owner" || value === "member") {
    return value;
  }
  throw new Response("organization member role must be owner or member.", {
    status: 400,
  });
}
