import {
  scryptSync,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";
import { SECRET_KEY } from "./env";

const ALGORITHM = "aes-192-gcm";
const SALT = "o2hDznbii*QKcUxw*aAj*@T47Q_LF7*GibB@HrEDbHeFzeprMCJ8cimzFQnUWuA-";
const KEY_BYTES = 24;
const KEY = scryptSync(SECRET_KEY, SALT, KEY_BYTES);

export function encrypt(data: Uint8Array): Uint8Array {
  const nonce = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, nonce);

  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([nonce, tag, ciphertext]);
}

export function decrypt(data: Uint8Array): Uint8Array {
  const nonce = data.slice(0, 12);
  const tag = data.slice(12, 28);
  const ciphertext = data.slice(28);

  const decipher = createDecipheriv(ALGORITHM, KEY, nonce);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return new Uint8Array(plaintext);
}
