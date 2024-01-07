import fastify from "fastify";

import authorize from "./src/routes/authorize";
import token from "./src/routes/token";
import refreshToken from "./src/routes/refresh-token";
import redirect from "./src/routes/redirect";
import index from "./src/routes/index";
import addSecurityHeaders from "./src/hooks";

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";

const server = fastify();

server
  .addHook("onRequest", addSecurityHeaders)
  .get("/", index)
  .get("/authorize", authorize)
  .get("/redirect", redirect)
  .post("/token", token)
  .post("/refresh-token", refreshToken);

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`started listening on ${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    server.log.error(err);
    process.exit(1);
  }
};
start();
