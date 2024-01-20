import fastify from "fastify";

import authorize from "./routes/authorize";
import token from "./routes/token";
import refreshToken from "./routes/refresh-token";
import redirect from "./routes/redirect";
import index from "./routes/index";
import addSecurityHeaders from "./hooks";
import { HOST, PORT, ENVIRONMENT } from "./env";
import { hasSessions } from "./sessions";

const loggers = {
  development: {
    transport: {
      target: "pino-pretty",
      level: "debug",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const server = fastify({ logger: loggers[ENVIRONMENT] || true });

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
  } catch (err) {
    console.error(err);
    server.log.error(err);
    process.exit(1);
  }

  process.on("SIGINT", async function () {
    server.log.info("Exiting...");
    while (hasSessions()) {
      server.log.info("Waiting for sessions to be cleared");
      await new Promise((r) => setTimeout(r, 3000));
    }
    server.close();
    process.exit(0);
  });
}