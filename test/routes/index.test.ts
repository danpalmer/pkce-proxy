import { test, expect } from "bun:test";

import supertest from "supertest";

import { server } from "../../src/server";

test("serves", async () => {
  await server.ready();
  await supertest(server.server)
    .get("/")
    .set("x-forwarded-proto", "https")
    .expect(200)
    .expect("Content-Type", "text/html; charset=UTF-8");
});

test("serves-https-redirect", async () => {
  await server.ready();
  const response = await supertest(server.server).get("/").expect(302);
  expect(response.headers["location"]).toStartWith("https://");
});
