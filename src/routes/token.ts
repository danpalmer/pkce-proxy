import type { FastifyRequest, FastifyReply } from "fastify";
import { find, consume } from "../sessions";
import { PROXY_REDIRECT_URL } from "../env";
import { getConfig } from "../client-config";
import { descriptiveClientError, descriptiveError } from "../errors";

export default async function token(req: FastifyRequest, res: FastifyReply) {
  const clientConfig = getConfig(req);
  const { code_verifier, client_id, code, ...extra } = req.body as any;
  if (!code_verifier || !client_id || !code) {
    return descriptiveClientError(
      req,
      res,
      "invalid_parameters",
      /* proxy= */ true,
      {
        parsed_request: { code_verifier, client_id, code, ...extra },
      }
    );
  }

  const session = await find(code, code_verifier);
  if (!session) {
    return descriptiveClientError(
      req,
      res,
      "invalid_grant",
      /* proxy= */ true,
      {
        parsed_request: { code_verifier, client_id, code, ...extra },
        message: "No matching session found for given code.",
      }
    );
  }

  await consume(session);

  let options: RequestInit = {};
  if (clientConfig.dataType === "json") {
    let body = JSON.stringify({
      client_id,
      client_secret: clientConfig.clientSecret,
      code,
      ...extra,
      redirect_uri: PROXY_REDIRECT_URL,
    });

    options = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body,
    };
  } else {
    const body = new URLSearchParams();
    body.append("client_id", client_id);
    body.append("client_secret", clientConfig.clientSecret);
    body.append("code", code);
    Object.keys(extra).forEach((k) => {
      body.append(k, extra[k]);
    });
    body.set("redirect_uri", PROXY_REDIRECT_URL);

    options = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
    };
  }

  if (clientConfig.authHeader) {
    options.headers = {
      ...options.headers,
      Authorization: clientConfig.authHeader,
    };
  }

  const response = await fetch(clientConfig.tokenUrl, {
    method: "POST",
    ...options,
  });

  if (!response.ok) {
    return descriptiveError(
      req,
      res,
      response.status,
      "upstream_error",
      false,
      {
        parsed_request: { code_verifier, client_id, code, ...extra },
        upstream_response: {
          headers: response.headers.entries(),
          body: await response.text(),
        },
      }
    );
  }

  res.status(response.status);
  const upstreamContentType = response.headers.get("Content-Type");
  if (upstreamContentType) {
    res.header("Content-Type", upstreamContentType);
  }
  return response.text();
}
