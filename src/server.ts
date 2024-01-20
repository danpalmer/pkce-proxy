import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import path from "path";

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

server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/public/",
});

server
  .addHook("onRequest", addSecurityHeaders)
  .get("/", index)
  .get("/:clientToken/authorize", authorize)
  .get("/:clientToken/redirect", redirect)
  .post("/:clientToken/token", token)
  .post("/:clientToken/refresh-token", refreshToken);

export async function start() {
  try {
    await server.listen({ port: PORT, host: HOST });
  } catch (err) {
    console.error(err);
    server.log.error(err);
    process.exit(1);
  }
}
