import fastify from "fastify";

import authorize from "./routes/authorize";
import token from "./routes/token";
import refreshToken from "./routes/refresh-token";
import redirect from "./routes/redirect";
import index from "./routes/index";
import addSecurityHeaders from "./hooks";
import { HOST, PORT } from "./env";

const server = fastify();

server
  .addHook("onRequest", addSecurityHeaders)
  .get("/", index)
  .get("/authorize", authorize)
  .get("/redirect", redirect)
  .post("/token", token)
  .post("/refresh-token", refreshToken);

export async function start() {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`started listening on ${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    server.log.error(err);
    process.exit(1);
  }
}
