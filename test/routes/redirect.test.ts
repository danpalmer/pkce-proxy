import test from "ava";
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

test("redirects", async (t) => {
  await server.ready();
  await add(CLIENT_ID, CLIENT_REDIRECT_URL, TEST_STATE, {
    code_challenge: CODE_CHALLENGE,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });

  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
    })
    .expect(307)
    .expect(
      "Location",
      `${CLIENT_REDIRECT_URL}?code=${CODE}&state=${TEST_STATE}`
    );
  t.falsy(response.text);

  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("redirects-with-extra-parameters", async (t) => {
  await server.ready();
  await add(CLIENT_ID, CLIENT_REDIRECT_URL, TEST_STATE, {
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
    .expect(307)
    .expect(
      "Location",
      `${CLIENT_REDIRECT_URL}?code=${CODE}&state=${TEST_STATE}&foo=bar&baz=quux`
    );
  t.falsy(response.text);

  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("redirects-with-redirect-uri-with-query", async (t) => {
  await server.ready();
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
    .expect(307)
    .expect(
      "Location",
      `${redirectUri}&code=${CODE}&state=${TEST_STATE}&foo=bar&baz=quux`
    );
  t.falsy(response.text);

  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("returns-invalid-grant-without-state", async (t) => {
  await server.ready();
  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      state: TEST_STATE,
    })
    .expect(400);
  t.deepEqual(JSON.parse(response.text), {
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

test("returns-invalid-parameters", async (t) => {
  await server.ready();
  const response = await supertest(server.server)
    .get(`/redirect`)
    .query({
      code: CODE,
      // No state.
    })
    .expect(400);
  t.deepEqual(JSON.parse(response.text), {
    error: "invalid_parameters",
    generated_by: "oauth_pkce_proxy",
    context: {
      parsed_request: {
        code: CODE,
      },
    },
  });
});
