import type { FastifyRequest, FastifyReply } from "fastify";
import { find, consume } from "../sessions";
import { PROXY_REDIRECT_URL } from "../env";
import { getConfig } from "../client-config";

export default async function token(req: FastifyRequest, res: FastifyReply) {
  const clientConfig = getConfig(req);
  const { code_verifier, client_id, code, ...extra } = req.body as any;

  const session = await find(code, code_verifier);

  if (!session) {
    res.status(400);
    return { error: "invalid_grant" };
  }

  await consume(session);

  let options: RequestInit = {};

  if (clientConfig.dataType === "json") {
    let body: string;
    try {
      body = JSON.stringify({
        client_id,
        client_secret: clientConfig.clientSecret,
        code,
        ...extra,
        redirect_uri: PROXY_REDIRECT_URL,
      });
    } catch (e) {
      console.error(e);
      res.status(400);
      return { error: "invalid_body" };
    }

    options = {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${client_id}:${clientConfig.clientSecret}`
        ).toString("base64")}`,
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

  const response = await fetch(clientConfig.tokenUrl, {
    method: "POST",
    ...options,
  });

  res.status(response.status);
  return response.json();
}
