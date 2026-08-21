import { quoteSqlText } from "../database/sql.ts";
import type { DatabaseGateway } from "../database/gateway.ts";
import type { SshKeyRecord } from "../domain/ssh_key.ts";
import type { UserRecord, UserRole } from "../domain/user.ts";

interface UserRow {
  id: string;
  username: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
}

interface ApiTokenRow {
  user_id: string;
}

interface SshKeyRow {
  id: string;
  user_id: string;
  label: string;
  public_key: string;
  created_at: string;
}

interface CountRow {
  count: number;
}

export class UserRepository {
  constructor(private readonly database: DatabaseGateway) {}

  async create(user: UserRecord): Promise<UserRecord> {
    await this.database.execute(`
      INSERT INTO users (id, username, password_hash, role, created_at)
      VALUES (
        ${quoteSqlText(user.id)},
        ${quoteSqlText(user.username)},
        ${quoteSqlText(user.passwordHash)},
        ${quoteSqlText(user.role)},
        ${quoteSqlText(user.createdAt)}
      );
    `);

    return user;
  }

  async findByUsername(username: string): Promise<UserRecord | null> {
    const rows = await this.database.query<UserRow>(`
      SELECT id, username, password_hash, role, created_at
      FROM users
      WHERE username = ${quoteSqlText(username)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toUserRecord(rows[0]);
  }

  async findById(id: string): Promise<UserRecord | null> {
    const rows = await this.database.query<UserRow>(`
      SELECT id, username, password_hash, role, created_at
      FROM users
      WHERE id = ${quoteSqlText(id)}
      LIMIT 1;
    `);
    return rows[0] === undefined ? null : toUserRecord(rows[0]);
  }

  async hasAnyUser(): Promise<boolean> {
    const rows = await this.database.query<CountRow>(`
      SELECT COUNT(*) AS count
      FROM users;
    `);
    return (rows[0]?.count ?? 0) > 0;
  }

  async createApiToken(input: {
    readonly id: string;
    readonly userId: string;
    readonly label: string;
    readonly tokenHash: string;
    readonly createdAt: string;
  }): Promise<void> {
    await this.database.execute(`
      INSERT INTO api_tokens (id, user_id, label, token_hash, created_at)
      VALUES (
        ${quoteSqlText(input.id)},
        ${quoteSqlText(input.userId)},
        ${quoteSqlText(input.label)},
        ${quoteSqlText(input.tokenHash)},
        ${quoteSqlText(input.createdAt)}
      );
    `);
  }

  async findUserIdByTokenHash(tokenHash: string): Promise<string | null> {
    const rows = await this.database.query<ApiTokenRow>(`
      SELECT user_id
      FROM api_tokens
      WHERE token_hash = ${quoteSqlText(tokenHash)}
      LIMIT 1;
    `);
    return rows[0]?.user_id ?? null;
  }

  async touchToken(tokenHash: string, usedAt: string): Promise<void> {
    await this.database.execute(`
      UPDATE api_tokens
      SET last_used_at = ${quoteSqlText(usedAt)}
      WHERE token_hash = ${quoteSqlText(tokenHash)};
    `);
  }

  async addSshKey(key: SshKeyRecord): Promise<SshKeyRecord> {
    await this.database.execute(`
      INSERT INTO ssh_keys (id, user_id, label, public_key, created_at)
      VALUES (
        ${quoteSqlText(key.id)},
        ${quoteSqlText(key.userId)},
        ${quoteSqlText(key.label)},
        ${quoteSqlText(key.publicKey)},
        ${quoteSqlText(key.createdAt)}
      );
    `);

    return key;
  }

  async listSshKeys(userId: string): Promise<SshKeyRecord[]> {
    const rows = await this.database.query<SshKeyRow>(`
      SELECT id, user_id, label, public_key, created_at
      FROM ssh_keys
      WHERE user_id = ${quoteSqlText(userId)}
      ORDER BY created_at ASC;
    `);
    return rows.map(toSshKeyRecord);
  }

  async deleteSshKey(userId: string, keyId: string): Promise<void> {
    await this.database.execute(`
      DELETE FROM ssh_keys
      WHERE user_id = ${quoteSqlText(userId)}
        AND id = ${quoteSqlText(keyId)};
    `);
  }
}

function toUserRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: row.role,
    createdAt: row.created_at,
  };
}

function toSshKeyRecord(row: SshKeyRow): SshKeyRecord {
  return {
    id: row.id,
    userId: row.user_id,
    label: row.label,
    publicKey: row.public_key,
    createdAt: row.created_at,
  };
}
