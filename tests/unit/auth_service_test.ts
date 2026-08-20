import { AuthService } from "../../src/services/auth_service.ts";
import { assert, assertEquals } from "../support/assert.ts";

interface MemoryUser {
  id: string;
  username: string;
  passwordHash: string;
  role: "admin" | "developer";
  createdAt: string;
}

class MemoryUsers {
  users: MemoryUser[] = [];
  tokens = new Map<string, string>();
  sshKeys: Array<{ id: string; userId: string; label: string; publicKey: string; createdAt: string }> = [];

  create(user: MemoryUser): Promise<MemoryUser> {
    this.users.push(user);
    return Promise.resolve(user);
  }

  findByUsername(username: string): Promise<MemoryUser | null> {
    return Promise.resolve(this.users.find((user) => user.username === username) ?? null);
  }

  findById(id: string): Promise<MemoryUser | null> {
    return Promise.resolve(this.users.find((user) => user.id === id) ?? null);
  }

  createApiToken(input: { readonly userId: string; readonly tokenHash: string }): Promise<void> {
    this.tokens.set(input.tokenHash, input.userId);
    return Promise.resolve();
  }

  findUserIdByTokenHash(tokenHash: string): Promise<string | null> {
    return Promise.resolve(this.tokens.get(tokenHash) ?? null);
  }

  touchToken(): Promise<void> {
    return Promise.resolve();
  }

  addSshKey(input: { readonly id: string; readonly userId: string; readonly label: string; readonly publicKey: string; readonly createdAt: string }) {
    this.sshKeys.push(input);
    return Promise.resolve(input);
  }

  listSshKeys(userId: string) {
    return Promise.resolve(this.sshKeys.filter((key) => key.userId === userId));
  }

  deleteSshKey(userId: string, keyId: string): Promise<void> {
    this.sshKeys = this.sshKeys.filter((key) => key.userId !== userId || key.id !== keyId);
    return Promise.resolve();
  }
}

class MemoryAudit {
  record(): Promise<void> {
    return Promise.resolve();
  }
}

Deno.test("registered users can authenticate with Basic credentials without exposing password hashes", async () => {
  const service = new AuthService(new MemoryUsers(), new MemoryAudit());

  const user = await service.register({
    username: "alice",
    password: "correct horse battery staple"
  });

  assertEquals(user.username, "alice");
  assert(!("passwordHash" in user), "public user must not expose password hashes.");

  const principal = await service.authenticateBasic("alice", "correct horse battery staple");
  assertEquals(principal?.username, "alice");

  const rejected = await service.authenticateBasic("alice", "incorrect horse battery staple");
  assertEquals(rejected, null);
});

Deno.test("created API tokens authenticate the owning user", async () => {
  const service = new AuthService(new MemoryUsers(), new MemoryAudit());

  await service.register({
    username: "alice",
    password: "correct horse battery staple"
  });
  const { token } = await service.createApiToken({
    username: "alice",
    password: "correct horse battery staple",
    label: "local"
  });

  const principal = await service.authenticateToken(token);
  assertEquals(principal?.username, "alice");
});

Deno.test("authenticated users can manage their SSH public keys without exposing other users", async () => {
  const store = new MemoryUsers();
  const service = new AuthService(store, new MemoryAudit());

  await service.register({
    username: "alice",
    password: "correct horse battery staple"
  });
  await service.register({
    username: "bob",
    password: "correct horse battery staple"
  });

  const alice = await service.authenticateBasic("alice", "correct horse battery staple");
  const bob = await service.authenticateBasic("bob", "correct horse battery staple");
  assert(alice !== null);
  assert(bob !== null);

  const key = await service.addSshKey({
    principal: alice,
    label: "laptop",
    publicKey: "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMMM alice"
  });

  assertEquals((await service.listSshKeys(alice)).length, 1);
  assertEquals((await service.listSshKeys(bob)).length, 0);

  await service.deleteSshKey(alice, key.id);
  assertEquals((await service.listSshKeys(alice)).length, 0);
});
