import { test, expect } from "bun:test";

import supertest from "supertest";

import { server } from "../../src/server";
import {
  AUTHORIZE_URL,
  CLIENT_SECRET,
  REFRESH_TOKEN_URL,
  TOKEN_URL,
} from "./_common";

test("serves", async () => {
  await server.ready();

  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      clientSecret: CLIENT_SECRET,
      authorizeUrl: AUTHORIZE_URL,
      tokenUrl: TOKEN_URL,
    })
    .set("x-forwarded-proto", "https")
    .expect(201)
    .expect("Content-Type", "text/html; charset=UTF-8");

  expect(response.text).toContain("/authorize");
  expect(response.text).toContain("/token");
  expect(response.text).toContain("/refresh-token");
  expect(response.text).toContain("https://proxy.dev/redirect");
});

test("serves-full", async () => {
  await server.ready();

  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      clientSecret: CLIENT_SECRET,
      authorizeUrl: AUTHORIZE_URL,
      tokenUrl: TOKEN_URL,
      dataType: "json",
      authHeader: "Bearer test",
      refreshTokenUrl: REFRESH_TOKEN_URL,
    })
    .set("x-forwarded-proto", "https")
    .expect(201)
    .expect("Content-Type", "text/html; charset=UTF-8");

  expect(response.text).toContain("/authorize");
  expect(response.text).toContain("/token");
  expect(response.text).toContain("/refresh-token");
  expect(response.text).toContain("https://proxy.dev/redirect");
});

test("error-no-form", async () => {
  await server.ready();
  const response = await supertest(server.server)
    .post("/create-config")
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "missing_required_parameters",
  });
});

test("error-missing-token-url", async () => {
  await server.ready();
  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      clientSecret: CLIENT_SECRET,
      authorizeUrl: AUTHORIZE_URL,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "missing_required_parameters",
  });
});

test("error-missing-authorize-url", async () => {
  await server.ready();
  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      clientSecret: CLIENT_SECRET,
      tokenUrl: TOKEN_URL,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "missing_required_parameters",
  });
});

test("error-missing-client-secret", async () => {
  await server.ready();
  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      tokenUrl: TOKEN_URL,
      authorizeUrl: AUTHORIZE_URL,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "missing_required_parameters",
  });
});

test("error-malformed-data-type", async () => {
  await server.ready();
  const response = await supertest(server.server)
    .post("/create-config")
    .send({
      clientSecret: CLIENT_SECRET,
      tokenUrl: TOKEN_URL,
      authorizeUrl: AUTHORIZE_URL,
      dataType: "xml",
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "malformed_parameters",
  });
});
