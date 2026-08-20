import { isGitWriteRequest } from "../../src/git/http_backend.ts";
import { assertEquals } from "../support/assert.ts";

Deno.test("git receive-pack requests are treated as write operations", () => {
  const refs = new Request(
    "http://localhost/git/alice/repo.git/info/refs?service=git-receive-pack",
  );
  const pack = new Request(
    "http://localhost/git/alice/repo.git/git-receive-pack",
    { method: "POST" },
  );

  assertEquals(isGitWriteRequest(refs, "/info/refs"), true);
  assertEquals(isGitWriteRequest(pack, "/git-receive-pack"), true);
});

Deno.test("git upload-pack requests are treated as read operations", () => {
  const refs = new Request(
    "http://localhost/git/alice/repo.git/info/refs?service=git-upload-pack",
  );
  const pack = new Request(
    "http://localhost/git/alice/repo.git/git-upload-pack",
    { method: "POST" },
  );

  assertEquals(isGitWriteRequest(refs, "/info/refs"), false);
  assertEquals(isGitWriteRequest(pack, "/git-upload-pack"), false);
});
