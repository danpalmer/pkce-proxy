import fastify from "fastify";
import { randomUUID } from "crypto";

const fakeGetHandlers: Record<string, (request: any, response: any) => any> =
  {};
const fakePostHandlers: Record<string, (request: any, response: any) => any> =
  {};

const server = fastify()
  .get("/:path", async (request, response) => {
    const path = (request.params as Record<string, string>).path;
    const handler = fakeGetHandlers[path];
    if (handler) {
      return handler(request, response);
    }
    response.status(404).send();
  })
  .post("/:path", async (request, response) => {
    const path = (request.params as Record<string, string>).path;
    const handler = fakePostHandlers[path];
    if (handler) {
      return handler(request, response);
    }
    response.status(404).send();
  });

let started = false;

export async function start() {
  if (started) {
    return;
  }
  await server.listen({ port: 3123, host: "localhost" });
  started = true;
}

export function addHandler(
  method: string,
  handler: (request: any, response: any) => any
): string {
  const path = randomUUID();
  if (method === "GET") {
    fakeGetHandlers[path] = handler;
  } else if (method === "POST") {
    fakePostHandlers[path] = handler;
  } else {
    throw new Error("Unsupported method");
  }
  return path;
}

export function getFakeServerUrl(path: string): string {
  return `http://localhost:3123/${path}`;
}
