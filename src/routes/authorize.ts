import type { FastifyRequest, FastifyReply } from "fastify";
import { add } from "../sessions";
import { PROXY_REDIRECT_URL } from "../env";
import { getConfig } from "../client-config";

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
    res.status(400);
    return { error: "missing_required_params" };
  }

  add(client_id, redirect_uri, state, {
    code_challenge,
    code_challenge_method,
  });

  const params = new URLSearchParams();
  params.append("client_id", client_id);
  params.append("state", state);
  Object.keys(extra).forEach((k) => {
    params.append(k, extra[k] as string);
  });
  params.set("redirect_uri", PROXY_REDIRECT_URL);

  return res.redirect(307, `${clientConfig.authorizeUrl}?${params.toString()}`);
}
