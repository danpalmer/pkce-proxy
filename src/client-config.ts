import { Buffer } from "buffer";
import * as zlib from "zlib";
import { FastifyRequest } from "fastify";

import { decrypt, encrypt } from "./crypto";

export interface ClientConfig {
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  refreshTokenUrl?: string;
  dataType?: "json" | "form";
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Important: dictionary changes will invalidate previously encoded tokens
const compressionDictionary = Buffer.from(
  "https,clientSecret,authorizeUrl,tokenUrl,refreshTokenUrl,dataType,json,form,authorize,refresh,token,com,www"
);

export function getConfig(req: FastifyRequest): ClientConfig {
  const clientToken = (req.params as Record<string, string>)
    .clientToken as string;
  return decode(clientToken);
}

export function decode(token: string): ClientConfig {
  const buffer = Buffer.from(decodeURIComponent(token), "base64");
  const decrypted = decrypt(buffer);
  const decompressed = zlib.inflateSync(decrypted, {
    dictionary: compressionDictionary,
  });
  return JSON.parse(decoder.decode(decompressed)) as ClientConfig;
}

export function encode(config: ClientConfig): string {
  const encoded = encoder.encode(JSON.stringify(config));
  const compressed = zlib.deflateSync(encoded, {
    dictionary: compressionDictionary,
  });
  const encrypted = encrypt(compressed);
  return encodeURIComponent(Buffer.from(encrypted).toString("base64"));
}
