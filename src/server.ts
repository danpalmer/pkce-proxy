import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFormBody from "@fastify/formbody";
import path from "path";

import authorize from "./routes/authorize";
import token from "./routes/token";
import refreshToken from "./routes/refresh-token";
import redirect from "./routes/redirect";
import index from "./routes/index";
import createConfig from "./routes/create-config";
import addSecurityHeaders from "./hooks";
import { HOST, PORT, ENVIRONMENT } from "./env";

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

const server = fastify({
  logger: loggers[ENVIRONMENT] || true,
  maxParamLength: 1000,
});

server.register(fastifyStatic, {
  root: path.join(__dirname, "..", "public"),
  prefix: "/public/",
});

server.register(fastifyFormBody);

server.addHook("onRequest", addSecurityHeaders);

server
  .get("/", index)
  .post("/create-config", createConfig)
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
