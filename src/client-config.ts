import { Buffer } from "buffer";
import * as zlib from "zlib";
import { FastifyReply, FastifyRequest } from "fastify";

import { decrypt, encrypt } from "./crypto";
import { descriptiveClientError } from "./errors";

export interface ClientConfig {
  clientSecret: string;
  authorizeUrl: string;
  tokenUrl: string;
  refreshTokenUrl?: string;
  dataType?: "json" | "form";
  authHeader?: string;
}

// Transforming to these parameters in the serialised form doesn't contribute
// much of a saving above including the keys in the compression dictionary, but
// it does separate the serialised form from the internal representation making
// it easier to extend with more optional parameters in the future.
const parameterMap = {
  clientSecret: "a",
  authorizeUrl: "b",
  tokenUrl: "c",
  refreshTokenUrl: "d",
  dataType: "e",
  authHeader: "f",
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Important: dictionary changes will invalidate previously encoded tokens
const compressionDictionary = Buffer.from(
  "https://,json,form,authorize,refresh,token,com,www,api,oauth,Basic,Bearer"
);

export function getConfig(
  req: FastifyRequest,
  res: FastifyReply
): [ClientConfig | undefined, any | undefined] {
  const clientToken = (req.params as Record<string, string>)
    .clientToken as string;
  if (!clientToken) {
    return [undefined, undefined];
  }

  try {
    return [decode(clientToken), undefined];
  } catch (e) {
    return [
      undefined,
      descriptiveClientError(
        req,
        res,
        "invalid_proxy_configuration_token",
        /* proxy= */ true,
        {
          token: clientToken,
          error: e.message,
        }
      ),
    ];
  }
}

export function decode(token: string): ClientConfig {
  const buffer = Buffer.from(decodeURIComponent(token), "base64");
  const decrypted = decrypt(buffer);
  const decompressed = zlib.inflateSync(decrypted, {
    dictionary: compressionDictionary,
  });
  return decodeParameters(JSON.parse(decoder.decode(decompressed)));
}

export function encode(config: ClientConfig): string {
  const encoded = encoder.encode(JSON.stringify(encodeParameters(config)));
  const compressed = zlib.deflateSync(encoded, {
    dictionary: compressionDictionary,
  });
  const encrypted = encrypt(compressed);
  return encodeURIComponent(Buffer.from(encrypted).toString("base64"));
}

function encodeParameters(config: ClientConfig): Record<string, string> {
  return Object.entries(parameterMap).reduce((acc, entry) => {
    const [decodedKey, encodedKey] = entry;
    const value = config[decodedKey as keyof ClientConfig];
    if (value) {
      acc[encodedKey] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

function decodeParameters(obj: Record<string, string>): ClientConfig {
  const config: ClientConfig = {
    clientSecret: obj[parameterMap["clientSecret"]] as string,
    authorizeUrl: obj[parameterMap["authorizeUrl"]] as string,
    tokenUrl: obj[parameterMap["tokenUrl"]] as string,
    dataType: obj[parameterMap["dataType"]] as "json" | "form" | undefined,
  };

  if (obj[parameterMap["refreshTokenUrl"]]) {
    config.refreshTokenUrl = obj[parameterMap["refreshTokenUrl"]];
  }
  if (obj[parameterMap["authHeader"]]) {
    config.authHeader = obj[parameterMap["authHeader"]];
  }

  return config;
}
