import crypto from "crypto";
import { FastifyReply, FastifyRequest } from "fastify";

import { ClientConfig, getConfig } from "./client-config";

export function descriptiveClientError(
  request: FastifyRequest,
  response: FastifyReply,
  errorCode: string,
  fromProxy: boolean,
  context: Record<string, any>
) {
  return descriptiveError(
    request,
    response,
    400,
    errorCode,
    fromProxy,
    context
  );
}

export function descriptiveError(
  request: FastifyRequest,
  response: FastifyReply,
  statusCode: number,
  errorCode: any,
  fromProxy: boolean,
  context: Record<string, any>
): FastifyReply {
  const error = {
    generated_by: fromProxy ? "oauth_pkce_proxy" : "upstream_oauth_provider",
    error: errorCode,
    context: context,
  } as any;

  if (errorCode !== "invalid_proxy_configuration_token") {
    const [clientConfig, _] = getConfig(request, response);
    if (clientConfig) {
      error.config = redactConfig(clientConfig);
    }
  }

  return response.status(statusCode).send(error);
}

function redactConfig(config: ClientConfig): ClientConfig {
  return {
    ...config,
    clientSecret: redactString(config.clientSecret),
  };
}

export function redactString(str: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(str);
  const hashedStr = hash.digest("hex");
  return hashedStr.substr(0, 8);
}
