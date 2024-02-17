import type { FastifyRequest, FastifyReply } from "fastify";

import { findByState, addCode } from "../sessions";

export default async function redirect(req: FastifyRequest, res: FastifyReply) {
  const { code, state, ...extra } = req.query as Record<string, string>;

  if (!code || !state) {
    res.status(400);
    return { error: "missing_required_params" };
  }

  const session = await findByState(state);

  if (!session) {
    res.status(400);
    return { error: "invalid_grant" };
  }

  await addCode(code, session);

  const params = new URLSearchParams();
  params.append("code", code as string);
  params.append("state", state as string);
  Object.keys(extra).forEach((k) => {
    params.append(k, extra[k] as string);
  });

  return res.redirect(307, `${session.redirect_uri}&${params.toString()}`);
}
