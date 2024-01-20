import { Buffer } from "buffer";

import { decrypt, encrypt } from "./crypto";

export interface ConfigToken {
  test?: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function decode(token: string): ConfigToken {
  const buffer = Buffer.from(token, "base64");
  const decrypted = decrypt(buffer);
  return JSON.parse(decoder.decode(decrypted)) as ConfigToken;
}

export function encode(config: ConfigToken): string {
  const encoded = encoder.encode(JSON.stringify(config));
  const encrypted = encrypt(encoded);
  return Buffer.from(encrypted).toString("base64");
}
