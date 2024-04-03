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

  // TODO: handle redirect URIs that already have query parameters.
  return res.redirect(307, `${session.redirect_uri}?${params.toString()}`);
}
