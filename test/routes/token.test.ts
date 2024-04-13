import { expect, test, beforeAll, afterEach } from "bun:test";
import fastify from "fastify";
import supertest from "supertest";

import { server } from "../../src/server";
import { add, addCode, consume, findByState } from "../../src/sessions";
import {
  createToken,
  CLIENT_ID,
  CLIENT_REDIRECT_URL,
  TEST_STATE,
  CODE_CHALLENGE,
  CODE_CHALLENGE_METHOD,
  AUTHORIZE_URL,
  REFRESH_TOKEN_URL,
  TOKEN_URL,
  CODE,
  CODE_VERIFIER,
} from "./_common";
import {
  start as startServer,
  addHandler,
  getFakeServerUrl,
} from "./_fake-server";

beforeAll(async () => {
  await server.ready();
  await startServer();
});

afterEach(async () => {
  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("serves-token-json", async () => {
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    return res
      .status(200)
      .header("Content-Type", "text/test")
      .send("test-token-response");
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
  });

  await add(CLIENT_ID, CLIENT_REDIRECT_URL, TEST_STATE, {
    code_challenge: CODE_CHALLENGE,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });
  let session = await findByState(TEST_STATE);
  if (!session) {
    throw new Error("No session found");
  }
  addCode(CODE, session);

  const response = await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(response.text).toEqual("test-token-response");
  expect(response.headers["content-type"]).toEqual("text/test");
});

test.todo("serves-token-form");
test.todo("serves-token-json-extra");
test.todo("serves-token-form-extra");
test.todo("consumes-session");
test.todo("fails-gracefully-on-upstream-failure");

test("fails-gracefully-with-missing-session", async () => {
  const token = createToken();
  const response = await supertest(server.server)
    .post(`/${token}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    config: {
      authorizeUrl: "https://api.example.com/oauth/authorize",
      clientSecret: "00d34061",
      dataType: "json",
      refreshTokenUrl: "https://api.example.com/oauth/refresh",
      tokenUrl: "https://api.example.com/oauth/token",
    },
    context: {
      message: "No matching session found for given code.",
      parsed_request: {
        client_id: "DC207A4D-4E83-433D-8C00-64E27A91E072",
        code: CODE,
        code_verifier: CODE_VERIFIER,
      },
    },
    error: "invalid_grant",
    generated_by: "oauth_pkce_proxy",
  });
});
