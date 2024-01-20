import { Buffer } from "buffer";
import { gunzipSync, gzipSync } from "zlib";
import { FastifyRequest } from "fastify";

import { decrypt, encrypt } from "./crypto";

export interface ClientConfig {
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  refreshTokenUrl?: string;
  jsonOrForm?: "json" | "form";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function getConfig(req: FastifyRequest): ClientConfig {
  const clientToken = (req.params as Record<string, string>)
    .clientToken as string;
  return decode(clientToken);
}

export function decode(token: string): ClientConfig {
  const buffer = Buffer.from(decodeURIComponent(token), "base64");
  const decrypted = decrypt(buffer);
  const decompressed = gunzipSync(decrypted);
  return JSON.parse(decoder.decode(decompressed)) as ClientConfig;
}

export function encode(config: ClientConfig): string {
  const encoded = encoder.encode(JSON.stringify(config));
  const compressed = gzipSync(encoded);
  const encrypted = encrypt(compressed);
  return encodeURIComponent(Buffer.from(encrypted).toString("base64"));
}
