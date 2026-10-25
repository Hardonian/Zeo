import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export interface EnvelopeKeyProvider {
  readonly keyId: string;
  wrapKey(dek: Uint8Array): Promise<WrappedKey>;
  unwrapKey(wrapped: WrappedKey): Promise<Uint8Array>;
}

export interface WrappedKey { ciphertext: Uint8Array; iv: Uint8Array; tag: Uint8Array; }

export interface EncryptedBlob {
  version: 'zeo.envelope.v1';
  keyId: string;
  wrappedDek: string;
  wrapIv: string;
  wrapTag: string;
  ciphertext: string;
  iv: string;
  tag: string;
}

/** Local-first KEK provider. Set a base64 or hex 32-byte key through the environment. */
export class EnvironmentKeyProvider implements EnvelopeKeyProvider {
  readonly keyId: string;
  private readonly kek: Buffer;

  constructor(secret: string, keyId = 'local-env-kek.v1') {
    const decoded = /^[0-9a-f]{64}$/i.test(secret) ? Buffer.from(secret, 'hex') : Buffer.from(secret, 'base64');
    if (decoded.length !== 32) throw new Error('Warehouse encryption key must decode to exactly 32 bytes.');
    this.kek = decoded;
    this.keyId = keyId;
  }

  async wrapKey(dek: Uint8Array): Promise<WrappedKey> { return this.encrypt(dek); }
  async unwrapKey(wrapped: WrappedKey): Promise<Uint8Array> { return this.decrypt(wrapped); }

  private encrypt(value: Uint8Array): WrappedKey {
    const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', this.kek, iv);
    const ciphertext = Buffer.concat([cipher.update(value), cipher.final()]);
    return { ciphertext, iv, tag: cipher.getAuthTag() };
  }
  private decrypt(wrapped: WrappedKey): Uint8Array {
    const decipher = createDecipheriv('aes-256-gcm', this.kek, wrapped.iv);
    decipher.setAuthTag(wrapped.tag);
    return Buffer.concat([decipher.update(wrapped.ciphertext), decipher.final()]);
  }
}

export async function encryptBlob(data: Uint8Array, provider: EnvelopeKeyProvider): Promise<EncryptedBlob> {
  const dek = randomBytes(32); const iv = randomBytes(12); const cipher = createCipheriv('aes-256-gcm', dek, iv);
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const wrapped = await provider.wrapKey(dek);
  return { version: 'zeo.envelope.v1', keyId: provider.keyId, wrappedDek: Buffer.from(wrapped.ciphertext).toString('base64'), wrapIv: Buffer.from(wrapped.iv).toString('base64'), wrapTag: Buffer.from(wrapped.tag).toString('base64'), ciphertext: ciphertext.toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64') };
}

export async function decryptBlob(blob: EncryptedBlob, provider: EnvelopeKeyProvider): Promise<Uint8Array> {
  if (blob.version !== 'zeo.envelope.v1' || blob.keyId !== provider.keyId) throw new Error('Encrypted blob key provider is unavailable. Configure the matching key provider.');
  const dek = await provider.unwrapKey({ ciphertext: Buffer.from(blob.wrappedDek, 'base64'), iv: Buffer.from(blob.wrapIv, 'base64'), tag: Buffer.from(blob.wrapTag, 'base64') });
  const decipher = createDecipheriv('aes-256-gcm', dek, Buffer.from(blob.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(blob.tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(blob.ciphertext, 'base64')), decipher.final()]);
}
