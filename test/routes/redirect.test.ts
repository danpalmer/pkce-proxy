import { expect, test, beforeAll, beforeEach, afterEach } from "bun:test";
import supertest from "supertest";

import { server } from "../../src/server";
import { add, consume, findByState } from "../../src/sessions";
import {
  CLIENT_ID,
  CLIENT_REDIRECT_URL,
  TEST_STATE,
  CODE_CHALLENGE,
  CODE_CHALLENGE_METHOD,
  CODE,
} from "./_common";

beforeAll(async () => {
  await server.ready();
});

beforeEach(async () => {
  await add(CLIENT_ID, CLIENT_REDIRECT_URL, TEST_STATE, {
    code_challenge: CODE_CHALLENGE,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });
});

afterEach(async () => {
  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("redirects", async () => {
  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
    })
    .set("x-forwarded-proto", "https")
    .expect(307)
    .expect(
      "Location",
      `${CLIENT_REDIRECT_URL}?code=${CODE}&state=${TEST_STATE}`
    );
  expect(response.text).toBeFalsy();
});

test("redirects-with-extra-parameters", async () => {
  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(307)
    .expect(
      "Location",
      `${CLIENT_REDIRECT_URL}?code=${CODE}&state=${TEST_STATE}&foo=bar&baz=quux`
    );
  expect(response.text).toBeFalsy();
});

test("redirects-with-redirect-uri-with-query", async () => {
  const redirectUri = "https://example.com/redirect?app=123";
  await add(CLIENT_ID, redirectUri, TEST_STATE, {
    code_challenge: CODE_CHALLENGE,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });

  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(307)
    .expect(
      "Location",
      `${redirectUri}&code=${CODE}&state=${TEST_STATE}&foo=bar&baz=quux`
    );
  expect(response.text).toBeFalsy();
});

test("fails-gracefully-with-invalid-grant-without-state", async () => {
  // Delete default session to test for missing state.
  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }

  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "invalid_grant",
    generated_by: "oauth_pkce_proxy",
    context: {
      parsed_request: {
        code: CODE,
        state: TEST_STATE,
      },
    },
  });
});

test("fails-gracefully-with-invalid-parameters", async () => {
  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      // No state.
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "invalid_parameters",
    generated_by: "oauth_pkce_proxy",
    context: {
      parsed_request: {
        code: CODE,
      },
    },
  });
});
