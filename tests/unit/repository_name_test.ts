import { createRepositoryId, validateRepositoryName } from "../../src/domain/repository.ts";
import { assertEquals, assertRejects } from "../support/assert.ts";

Deno.test("repository names preserve valid external repository identifiers", () => {
  assertEquals(validateRepositoryName("team-alpha", "owner"), "team-alpha");
  assertEquals(validateRepositoryName("service_api", "name"), "service_api");
  assertEquals(createRepositoryId("team-alpha", "service_api"), "team-alpha/service_api");
});

Deno.test("repository names reject path traversal before Git or database access", () => {
  assertRejects(() => validateRepositoryName("../secret", "name"), "alphanumeric");
  assertRejects(() => validateRepositoryName("team/secret", "owner"), "alphanumeric");
  assertRejects(() => validateRepositoryName("repo.git", "name"), ".git suffix");
});
