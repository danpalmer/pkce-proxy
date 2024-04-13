import type { FastifyRequest, FastifyReply } from "fastify";
import { add } from "../sessions";
import { PROXY_REDIRECT_URL } from "../env";
import { getConfig } from "../client-config";
import { descriptiveClientError, descriptiveError } from "../errors";

export default async function authorize(
  req: FastifyRequest,
  res: FastifyReply
) {
  const clientConfig = getConfig(req);

  const {
    client_id,
    redirect_uri,
    code_challenge,
    code_challenge_method,
    state,
    ...extra
  } = req.query as Record<string, string>;

  if (
    !client_id ||
    !state ||
    !redirect_uri ||
    !code_challenge ||
    !code_challenge_method
  ) {
    return descriptiveClientError(
      req,
      res,
      "invalid_parameters",
      /* proxy= */ true,
      {
        parsed_request: {
          client_id,
          redirect_uri,
          code_challenge,
          code_challenge_method,
          state,
          ...extra,
        },
      }
    );
  }

  if (code_challenge_method !== "S256" && code_challenge_method !== "plain") {
    return descriptiveClientError(
      req,
      res,
      "invalid_code_challenge_method",
      /* proxy= */ true,
      {
        parsed_request: {
          client_id,
          redirect_uri,
          code_challenge,
          code_challenge_method,
          state,
          ...extra,
        },
        message: "Unsupported challenge method, must be S256 or plain",
      }
    );
  }

  try {
    await add(client_id, redirect_uri, state, {
      code_challenge,
      code_challenge_method,
    });
  } catch (e) {
    return descriptiveError(req, res, 503, "storage_error", /* proxy= */ true, {
      message: "Proxy Redis is down",
    });
  }

  const params = new URLSearchParams();
  params.append("client_id", client_id);
  params.append("state", state);
  Object.keys(extra).forEach((k) => {
    params.append(k, extra[k] as string);
  });
  params.set("redirect_uri", PROXY_REDIRECT_URL);

  return res.redirect(307, `${clientConfig.authorizeUrl}?${params.toString()}`);
}
