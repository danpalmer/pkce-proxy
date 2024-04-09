import { test } from "bun:test";

import supertest from "supertest";

import { server } from "../../src/server";

test("serves", async () => {
  await server.ready();
  await supertest(server.server)
    .get("/")
    .expect(200)
    .expect("Content-Type", "text/html; charset=UTF-8");
});
