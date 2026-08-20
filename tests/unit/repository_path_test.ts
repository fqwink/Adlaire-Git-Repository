import { validateGitRef, validateRepositoryPath } from "../../src/domain/repository_path.ts";
import { assertEquals, assertRejects } from "../support/assert.ts";

Deno.test("repository paths allow nested file paths used by code browsing", () => {
  assertEquals(validateRepositoryPath("src/main.ts"), "src/main.ts");
  assertEquals(validateRepositoryPath("README.md"), "README.md");
});

Deno.test("repository paths reject traversal and absolute paths", () => {
  assertRejects(() => validateRepositoryPath("../secret"), "traversal");
  assertRejects(() => validateRepositoryPath("/etc/passwd"), "relative");
  assertRejects(() => validateRepositoryPath("src/../secret"), "traversal");
});

Deno.test("git refs reject obvious option and traversal input", () => {
  assertEquals(validateGitRef("main"), "main");
  assertRejects(() => validateGitRef("--upload-pack=/tmp/x"), "invalid");
  assertRejects(() => validateGitRef("feature..main"), "invalid");
  assertRejects(() => validateGitRef("main:README.md"), "invalid");
});
