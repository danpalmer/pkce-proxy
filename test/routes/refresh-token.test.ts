import { expect, test, beforeAll, beforeEach, afterEach } from "bun:test";
import supertest from "supertest";

import { server } from "../../src/server";
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
  REFRESH_TOKEN,
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

test("serves-refresh-token-json", async () => {
  let serverAssertion = () => {};
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        redirect_uri: PROXY_REDIRECT_URL,
      });
      expect(req.headers["content-type"]).toEqual("application/json");
    };
    return res.status(200).send({ refresh_token: "test" });
  });

  const clientToken = createToken({
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(JSON.parse(response.text)).toEqual({ refresh_token: "test" });
  expect(response.headers["content-type"]).toEqual(
    "application/json; charset=utf-8"
  );

  serverAssertion();
});

test("serves-refresh-token-form", async () => {
  let serverAssertion = () => {};
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
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
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    dataType: "form",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(response.text).toEqual("test-token-response");
  expect(response.headers["content-type"]).toEqual("text/test");

  serverAssertion();
});

test("serves-refresh-token-json-extra", async () => {
  let serverAssertion = () => {};
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        redirect_uri: PROXY_REDIRECT_URL,
        foo: "bar",
        baz: "quux",
      });
      expect(req.headers["content-type"]).toEqual("application/json");
    };
    return res.status(200).send({ refresh_token: "test" });
  });

  const clientToken = createToken({
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(JSON.parse(response.text)).toEqual({ refresh_token: "test" });
  expect(response.headers["content-type"]).toEqual(
    "application/json; charset=utf-8"
  );

  serverAssertion();
});

test("serves-refresh-token-form-extra", async () => {
  let serverAssertion = () => {};
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.body).toEqual({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
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
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    dataType: "form",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
      foo: "bar",
      baz: "quux",
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  expect(response.text).toEqual("test-token-response");
  expect(response.headers["content-type"]).toEqual("text/test");

  serverAssertion();
});

test("passes-auth-header", async () => {
  let serverAssertion = () => {};
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    serverAssertion = () => {
      expect(req.headers["authorization"]).toEqual("Bearer test");
    };
    return res.status(200).send({ refresh_token: "test" });
  });

  const clientToken = createToken({
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    authHeader: "Bearer test",
  });

  await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
    })
    .set("x-forwarded-proto", "https")
    .expect(200);

  serverAssertion();
});

test("fails-gracefully-on-upstream-failure", async () => {
  const upstreamRefreshPath = addHandler("POST", (req, res) => {
    return res.status(451).send({ failure: "test" });
  });

  const clientToken = createToken({
    refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
    dataType: "json",
  });

  const response = await supertest(server.server)
    .post(`/${clientToken}/refresh-token`)
    .send({
      client_id: CLIENT_ID,
      refresh_token: REFRESH_TOKEN,
    })
    .set("x-forwarded-proto", "https")
    .expect(451);

  expect(JSON.parse(response.text)).toEqual({
    config: {
      authorizeUrl: AUTHORIZE_URL,
      clientSecret: "00d34061",
      dataType: "json",
      refreshTokenUrl: getFakeServerUrl(upstreamRefreshPath),
      tokenUrl: TOKEN_URL,
    },
    context: {
      parsed_request: {
        client_id: CLIENT_ID,
        refresh_token: "0a9b110d",
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

test("fails-gracefully-with-missing-query", async () => {
  const token = createToken();
  const response = await supertest(server.server)
    .post(`/${token}/refresh-token`)
    .send({
      refresh_token: REFRESH_TOKEN,
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
        refresh_token: "0a9b110d",
      },
    },
    error: "invalid_parameters",
    generated_by: "oauth_pkce_proxy",
  });
});

test("fails-gracefully-with-invalid-client-token", async () => {
  const response = await supertest(server.server)
    .post("/invalid-token/refresh-token")
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
