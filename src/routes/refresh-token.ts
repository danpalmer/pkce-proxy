import type { FastifyRequest, FastifyReply } from "fastify";
import { URLSearchParams } from "url";

import { PROXY_REDIRECT_URL } from "../env";
import { getConfig } from "../client-config";
import {
  descriptiveClientError,
  descriptiveError,
  redactString,
} from "../errors";

export default async function refresh_token(
  req: FastifyRequest,
  res: FastifyReply
) {
  const [clientConfig, configError] = getConfig(req, res);
  if (configError) {
    return configError;
  }

  const { client_id, refresh_token, ...extra } = req.body as any;
  if (!client_id || !refresh_token) {
    return descriptiveClientError(
      req,
      res,
      "invalid_parameters",
      /* proxy= */ true,
      {
        parsed_request: {
          client_id,
          refresh_token: redactString(refresh_token),
          ...extra,
        },
      }
    );
  }

  let options: RequestInit = {};
  if (clientConfig.dataType === "json") {
    let body = JSON.stringify({
      client_id,
      client_secret: clientConfig.clientSecret,
      refresh_token,
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
    body.append("refresh_token", refresh_token);
    Object.keys(extra).forEach((k) => {
      body.append(k, extra[k]);
    });
    body.append("redirect_uri", PROXY_REDIRECT_URL);

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

  const response = await fetch(
    clientConfig.refreshTokenUrl || clientConfig.tokenUrl,
    {
      method: "POST",
      ...options,
    }
  );

  if (!response.ok) {
    return descriptiveError(
      req,
      res,
      response.status,
      "upstream_error",
      false,
      {
        parsed_request: {
          client_id,
          refresh_token: redactString(refresh_token),
          ...extra,
        },
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
