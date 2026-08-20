export interface SshKeyRecord {
  readonly id: string;
  readonly userId: string;
  readonly label: string;
  readonly publicKey: string;
  readonly createdAt: string;
}

export interface PublicSshKey {
  readonly id: string;
  readonly label: string;
  readonly publicKey: string;
  readonly createdAt: string;
}

const SUPPORTED_PREFIXES = ["ssh-ed25519", "ssh-rsa", "ecdsa-sha2-nistp256"];

export function validateSshPublicKey(value: string): string {
  const key = value.trim();
  const [prefix, body] = key.split(/\s+/, 2);

  if (
    !SUPPORTED_PREFIXES.includes(prefix) || body === undefined ||
    body.length < 32
  ) {
    throw new Error("ssh public key must be an OpenSSH public key.");
  }

  return key;
}

export function toPublicSshKey(record: SshKeyRecord): PublicSshKey {
  return {
    id: record.id,
    label: record.label,
    publicKey: record.publicKey,
    createdAt: record.createdAt,
  };
}
