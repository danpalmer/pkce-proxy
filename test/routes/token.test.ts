import { expect, test, beforeAll, beforeEach, afterEach } from "bun:test";
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
  CODE,
  CODE_VERIFIER,
  CLIENT_SECRET,
  PROXY_REDIRECT_URL,
  REFRESH_TOKEN_URL,
  TOKEN_URL,
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

beforeEach(async () => {
  await add(CLIENT_ID, CLIENT_REDIRECT_URL, TEST_STATE, {
    code_challenge: CODE_CHALLENGE,
    code_challenge_method: CODE_CHALLENGE_METHOD,
  });
  let session = await findByState(TEST_STATE);
  if (!session) {
    throw new Error("No session found");
  }
  addCode(CODE, session);
});

afterEach(async () => {
  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }
});

test("serves-token-json", async () => {
  let serverAssertion = () => {};
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        redirect_uri: PROXY_REDIRECT_URL,
      });
      expect(req.headers["content-type"]).toEqual("application/json");
    };
    return res.status(200).send({ token: "test" });
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(JSON.parse(response.text)).toEqual({ token: "test" });
  expect(response.headers["content-type"]).toEqual(
    "application/json; charset=utf-8"
  );

  serverAssertion();
});

test("serves-token-form", async () => {
  let serverAssertion = () => {};
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        redirect_uri: PROXY_REDIRECT_URL,
      });
      expect(req.headers["content-type"]).toEqual(
        "application/x-www-form-urlencoded"
      );
    };
    return res
      .status(200)
      .header("Content-Type", "text/test")
      .send("test-token-response");
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "form",
  });

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

  serverAssertion();
});

test("serves-token-json-extra", async () => {
  let serverAssertion = () => {};
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        redirect_uri: PROXY_REDIRECT_URL,
        foo: "bar",
        baz: "quux",
      });
      expect(req.headers["content-type"]).toEqual("application/json");
    };
    return res.status(200).send({ token: "test" });
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(JSON.parse(response.text)).toEqual({ token: "test" });
  expect(response.headers["content-type"]).toEqual(
    "application/json; charset=utf-8"
  );

  serverAssertion();
});

test("serves-token-form-extra", async () => {
  let serverAssertion = () => {};
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: CODE,
        redirect_uri: PROXY_REDIRECT_URL,
        foo: "bar",
        baz: "quux",
      });
      expect(req.headers["content-type"]).toEqual(
        "application/x-www-form-urlencoded"
      );
    };
    return res
      .status(200)
      .header("Content-Type", "text/test")
      .send("test-token-response");
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "form",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(response.text).toEqual("test-token-response");
  expect(response.headers["content-type"]).toEqual("text/test");

  serverAssertion();
});

test("consumes-session", async () => {
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    return res.status(200).send({ token: "test" });
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "json",
  });

  await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  const session = await findByState(TEST_STATE);
  expect(session).toBeUndefined();
});

test("passes-auth-header", async () => {
  let serverAssertion = () => {};
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.headers["authorization"]).toEqual("Bearer test");
    };
    return res.status(200).send({ token: "test" });
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    authHeader: "Bearer test",
  });

  await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  serverAssertion();
});

test("fails-gracefully-on-upstream-failure", async () => {
  const upstreamTokenPath = addHandler("POST", (req, res) => {
    return res.status(451).send({ failure: "test" });
  });

  const clientToken = createToken({
    tokenUrl: getFakeServerUrl(upstreamTokenPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/token`)
    .send({
      client_id: CLIENT_ID,
      code_verifier: CODE_VERIFIER,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(451);

  expect(JSON.parse(response.text)).toEqual({
    config: {
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061",
      dataType: "json",
      refreshTokenUrl: REFRESH_TOKEN_URL,
      tokenUrl: getFakeServerUrl(upstreamTokenPath),
    },
    context: {
      parsed_request: {
        client_id: CLIENT_ID,
        code: CODE,
        code_verifier: CODE_VERIFIER,
      },
      upstream_response: {
        body: '{"failure":"test"}',
        headers: {},
      },
    },
    error: "upstream_error",
    generated_by: "upstream_oauth_provider",
  });
});

test("fails-gracefully-with-missing-session", async () => {
  // Delete the default session
  const session = await findByState(TEST_STATE);
  if (session) {
    await consume(session);
  }

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
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061",
      dataType: "json",
      refreshTokenUrl: REFRESH_TOKEN_URL,
      tokenUrl: TOKEN_URL,
    },
    context: {
      message: "No matching session found for given code.",
      parsed_request: {
        client_id: CLIENT_ID,
        code: CODE,
        code_verifier: CODE_VERIFIER,
      },
    },
    error: "invalid_grant",
    generated_by: "oauth_pkce_proxy",
  });
});

test("fails-gracefully-with-missing-query", async () => {
  const token = createToken();
  const response = await supertest(server.server)
    .post(`/${token}/token`)
    .send({
      client_id: CLIENT_ID,
      code: CODE,
    })
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    config: {
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061",
      dataType: "json",
      refreshTokenUrl: REFRESH_TOKEN_URL,
      tokenUrl: TOKEN_URL,
    },
    context: {
      parsed_request: {
        client_id: CLIENT_ID,
        code: CODE,
      },
    },
    error: "invalid_parameters",
    generated_by: "oauth_pkce_proxy",
  });
});

test("fails-gracefully-with-invalid-client-token", async () => {
  const response = await supertest(server.server)
    .post("/invalid-token/token")
    .set("x-forwarded-proto", "https")
    .expect(400);
  expect(JSON.parse(response.text)).toEqual({
    error: "invalid_proxy_configuration_token",
    generated_by: "oauth_pkce_proxy",
    context: {
      token: "invalid-token",
      error: "Unsupported state or unable to authenticate data",
    },
  });
});
