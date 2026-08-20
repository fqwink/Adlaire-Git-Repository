import {
  createToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "../domain/auth.ts";
import {
  type PublicSshKey,
  toPublicSshKey,
  validateSshPublicKey,
} from "../domain/ssh_key.ts";
import {
  type Principal,
  type PublicUser,
  toPrincipal,
  toPublicUser,
  validateUsername,
} from "../domain/user.ts";
import type { AuditSink } from "./audit_service.ts";

export interface UserStore {
  create(user: {
    readonly id: string;
    readonly username: string;
    readonly passwordHash: string;
    readonly role: "admin" | "developer";
    readonly createdAt: string;
  }): Promise<{
    readonly id: string;
    readonly username: string;
    readonly passwordHash: string;
    readonly role: "admin" | "developer";
    readonly createdAt: string;
  }>;
  findByUsername(username: string): Promise<
    {
      readonly id: string;
      readonly username: string;
      readonly passwordHash: string;
      readonly role: "admin" | "developer";
      readonly createdAt: string;
    } | null
  >;
  findById(id: string): Promise<
    {
      readonly id: string;
      readonly username: string;
      readonly passwordHash: string;
      readonly role: "admin" | "developer";
      readonly createdAt: string;
    } | null
  >;
  createApiToken(input: {
    readonly id: string;
    readonly userId: string;
    readonly label: string;
    readonly tokenHash: string;
    readonly createdAt: string;
  }): Promise<void>;
  findUserIdByTokenHash(tokenHash: string): Promise<string | null>;
  touchToken(tokenHash: string, usedAt: string): Promise<void>;
  addSshKey(input: {
    readonly id: string;
    readonly userId: string;
    readonly label: string;
    readonly publicKey: string;
    readonly createdAt: string;
  }): Promise<{
    readonly id: string;
    readonly userId: string;
    readonly label: string;
    readonly publicKey: string;
    readonly createdAt: string;
  }>;
  listSshKeys(userId: string): Promise<{
    readonly id: string;
    readonly userId: string;
    readonly label: string;
    readonly publicKey: string;
    readonly createdAt: string;
  }[]>;
  deleteSshKey(userId: string, keyId: string): Promise<void>;
}

export class AuthService {
  constructor(
    private readonly users: UserStore,
    private readonly audit: AuditSink,
  ) {}

  async register(input: {
    readonly username: string;
    readonly password: string;
    readonly role?: "admin" | "developer";
  }): Promise<PublicUser> {
    const username = validateUsername(input.username);
    const now = new Date().toISOString();
    const user = await this.users.create({
      id: crypto.randomUUID(),
      username,
      passwordHash: await hashPassword(input.password),
      role: input.role ?? "developer",
      createdAt: now,
    });

    await this.audit.record({
      actor: username,
      action: "user.register",
      targetType: "user",
      targetId: user.id,
    });

    return toPublicUser(user);
  }

  async authenticateBasic(
    username: string,
    password: string,
  ): Promise<Principal | null> {
    const user = await this.users.findByUsername(validateUsername(username));
    if (user === null || !(await verifyPassword(password, user.passwordHash))) {
      return null;
    }
    return toPrincipal(user);
  }

  async authenticateToken(token: string): Promise<Principal | null> {
    const tokenHash = await hashToken(token);
    const userId = await this.users.findUserIdByTokenHash(tokenHash);
    if (userId === null) {
      return null;
    }
    await this.users.touchToken(tokenHash, new Date().toISOString());
    const user = await this.users.findById(userId);
    return user === null ? null : toPrincipal(user);
  }

  async createApiToken(input: {
    readonly username: string;
    readonly password: string;
    readonly label: string;
  }): Promise<{ readonly token: string }> {
    const principal = await this.authenticateBasic(
      input.username,
      input.password,
    );
    if (principal === null) {
      throw new Response("invalid credentials.", { status: 401 });
    }

    const label = input.label.trim();
    if (label === "") {
      throw new Response("label is required.", { status: 400 });
    }

    const token = createToken();
    await this.users.createApiToken({
      id: crypto.randomUUID(),
      userId: principal.id,
      label,
      tokenHash: await hashToken(token),
      createdAt: new Date().toISOString(),
    });

    await this.audit.record({
      actor: principal.username,
      action: "token.create",
      targetType: "user",
      targetId: principal.id,
    });

    return { token };
  }

  async addSshKey(input: {
    readonly principal: Principal;
    readonly label: string;
    readonly publicKey: string;
  }): Promise<PublicSshKey> {
    const label = input.label.trim();
    if (label === "") {
      throw new Response("label is required.", { status: 400 });
    }

    const key = await this.users.addSshKey({
      id: crypto.randomUUID(),
      userId: input.principal.id,
      label,
      publicKey: validateSshPublicKey(input.publicKey),
      createdAt: new Date().toISOString(),
    });

    await this.audit.record({
      actor: input.principal.username,
      action: "ssh_key.add",
      targetType: "user",
      targetId: input.principal.id,
    });

    return toPublicSshKey(key);
  }

  async listSshKeys(principal: Principal): Promise<PublicSshKey[]> {
    return (await this.users.listSshKeys(principal.id)).map(toPublicSshKey);
  }

  async deleteSshKey(principal: Principal, keyId: string): Promise<void> {
    await this.users.deleteSshKey(principal.id, keyId);
    await this.audit.record({
      actor: principal.username,
      action: "ssh_key.delete",
      targetType: "user",
      targetId: principal.id,
    });
  }
}
