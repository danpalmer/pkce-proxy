import fs from "fs";
import path from "path";
import type { FastifyRequest, FastifyReply } from "fastify";

import { encode } from "../client-config";
import { PROXY_HOSTNAME } from "../env";

const template = fs
  .readFileSync(path.join(__dirname, "..", "..", "public", "config.html"))
  .toString();

export default function createConfig(req: FastifyRequest, res: FastifyReply) {
  const form = req.body as Record<string, string>;
  if (!form || !form.clientSecret || !form.authorizeUrl || !form.tokenUrl) {
    res.status(400);
    return { error: "missing_required_parameters" };
  }

  if (
    (form.dataType != "json" && form.dataType != "form" && form.dataType) ||
    (form.authHeader && typeof form.authHeader !== "string")
  ) {
    res.status(400);
    return { error: "malformed_parameters" };
  }

  const config = {
    clientSecret: form.clientSecret,
    authorizeUrl: form.authorizeUrl,
    tokenUrl: form.tokenUrl,
    refreshTokenUrl: form.refreshTokenUrl,
    dataType: form.dataType as "form" | "json" | undefined,
    authHeader: form.authHeader,
  };

  const token = encode(config);
  const data = template
    .replaceAll("TOKEN", token)
    .replaceAll("PROXY_HOSTNAME", PROXY_HOSTNAME);

  return res
    .status(201)
    .header("Content-Type", "text/html; charset=UTF-8")
    .send(data);
}
