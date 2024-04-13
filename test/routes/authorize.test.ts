import { expect, test } from "bun:test";
import supertest from "supertest";

import { server } from "../../src/server";
import { PROXY_HOSTNAME } from "../../src/env";
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
} from "./_common";

test("redirects", async () => {
  await server.ready();
  const token = createToken();
  const response = await supertest(server.server)
    .get(`/${token}/authorize`)
    .query({
      client_id: CLIENT_ID,
      redirect_uri: CLIENT_REDIRECT_URL,
      state: TEST_STATE,
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: CODE_CHALLENGE_METHOD,
    })
    .set("x-forwarded-proto", "https")
    .expect(307)
    .expect(
      "Location",
      `https://api.example.com/oauth/authorize?client_id=${CLIENT_ID}&state=${TEST_STATE}&redirect_uri=https%3A%2F%2F${PROXY_HOSTNAME}%2Fredirect`
    );
  expect(response.text).toBeFalsy();
});

test("redirects-with-extra-parameters", async () => {
  await server.ready();
  const token = createToken();
  const response = await supertest(server.server)
    .get(`/${token}/authorize`)
    .query({
      client_id: CLIENT_ID,
      redirect_uri: CLIENT_REDIRECT_URL,
      state: TEST_STATE,
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: CODE_CHALLENGE_METHOD,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(307)
    .expect(
      "Location",
      `https://api.example.com/oauth/authorize?client_id=${CLIENT_ID}&state=${TEST_STATE}&foo=bar&baz=quux&redirect_uri=https%3A%2F%2F${PROXY_HOSTNAME}%2Fredirect`
    );
  expect(response.text).toBeFalsy();
});

test("returns-invalid-parameters", async () => {
  await server.ready();
  const token = createToken();
  const response = await supertest(server.server)
    .get(`/${token}/authorize`)
    .query({
      client_id: CLIENT_ID,
      redirect_uri: CLIENT_REDIRECT_URL,
      state: "", // No state
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: CODE_CHALLENGE_METHOD,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "invalid_parameters",
    generated_by: "oauth_pkce_proxy",
    config: {
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061", // Redacted
      dataType: "json",
      refreshTokenUrl: REFRESH_TOKEN_URL,
      tokenUrl: TOKEN_URL,
    },
    context: {
      parsed_request: {
        client_id: CLIENT_ID,
        code_challenge: CODE_CHALLENGE,
        code_challenge_method: CODE_CHALLENGE_METHOD,
        redirect_uri: CLIENT_REDIRECT_URL,
        state: "", // Failing
      },
    },
  });
});

test("returns-unsupported-challenge-method", async () => {
  await server.ready();
  const token = createToken();
  const response = await supertest(server.server)
    .get(`/${token}/authorize`)
    .query({
      client_id: CLIENT_ID,
      redirect_uri: CLIENT_REDIRECT_URL,
      state: TEST_STATE,
      code_challenge: CODE_CHALLENGE,
      code_challenge_method: "S512",
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "invalid_code_challenge_method",
    generated_by: "oauth_pkce_proxy",
    config: {
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061", // Redacted
      dataType: "json",
      refreshTokenUrl: REFRESH_TOKEN_URL,
      tokenUrl: TOKEN_URL,
    },
    context: {
      message: "Unsupported challenge method, must be S256 or plain",
      parsed_request: {
        client_id: CLIENT_ID,
        code_challenge: CODE_CHALLENGE,
        code_challenge_method: "S512",
        redirect_uri: CLIENT_REDIRECT_URL,
        state: TEST_STATE,
      },
    },
  });
});
