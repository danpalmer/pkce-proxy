import { Buffer } from "buffer";

import { decrypt, encrypt } from "./crypto";
import { gunzipSync, gzipSync } from "zlib";

export interface ConfigToken {
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  refreshTokenUrl?: string;
  jsonOrForm?: "json" | "form";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function decode(token: string): ConfigToken {
  const buffer = Buffer.from(decodeURIComponent(token), "base64");
  const decrypted = decrypt(buffer);
  const decompressed = gunzipSync(decrypted);
  return JSON.parse(decoder.decode(decompressed)) as ConfigToken;
}

export function encode(config: ConfigToken): string {
  const encoded = encoder.encode(JSON.stringify(config));
  const compressed = gzipSync(encoded);
  const encrypted = encrypt(compressed);
  return encodeURIComponent(Buffer.from(encrypted).toString("base64"));
}
