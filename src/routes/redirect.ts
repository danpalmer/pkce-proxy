import type { FastifyRequest, FastifyReply } from "fastify";

import { findByState, addCode } from "../sessions";
import { descriptiveClientError } from "../errors";

export default async function redirect(req: FastifyRequest, res: FastifyReply) {
  const { code, state, ...extra } = req.query as Record<string, string>;

  if (!code || !state) {
    return descriptiveClientError(
      req,
      res,
      "invalid_parameters",
      /* proxy= */ true,
      { parsed_request: { code, state, ...extra } }
    );
  }

  const session = await findByState(state);

  if (!session) {
    return descriptiveClientError(
      req,
      res,
      "invalid_grant",
      /* proxy= */ true,
      { parsed_request: { code, state, ...extra } }
    );
  }

  await addCode(code, session);

  const params = new URLSearchParams();
  params.append("code", code as string);
  params.append("state", state as string);
  Object.keys(extra).forEach((k) => {
    params.append(k, extra[k] as string);
  });

  // We don't fully parse the URI here because this may be an app-specific URI
  // like `myapp://auth-callback` and we don't want to round-trip through a
  // parser that might try to normalise things. Instead we rely on `?` not being
  // a URL safe character, and look for its presence to see if there are already
  // query parameters.
  let redirectUri = session.redirect_uri;
  if (redirectUri.indexOf("?") === -1) {
    redirectUri += "?" + params.toString();
  } else {
    redirectUri += "&" + params.toString();
  }

  return res.redirect(307, redirectUri);
}
