import test from "ava";

import * as config from "../src/client-config";
import { FastifyRequest } from "fastify";

test("round-trip-full", (t) => {
  const value: config.ClientConfig = {
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    refreshTokenUrl: "https://example.com/refresh",
    dataType: "json",
    basicAuthHeader: "Basic YmVlcw==",
  };

  const encoded = config.encode(value);
  const decoded = config.decode(encoded);
  t.deepEqual(value, decoded);
});

test("round-trip-small", (t) => {
  const value: config.ClientConfig = {
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    dataType: "json",
  };

  const encoded = config.encode(value);
  const decoded = config.decode(encoded);
  t.deepEqual(value, decoded);
});

test("request-config", (t) => {
  const req = {
    params: {
      clientToken:
        "ktSUMEi92bjxr%2FfuaLMZ36PYMUmly9ri8Ea6%2FHeXNGcFCAuyDo%2FNq1g1M5%2BcaZpCLYX8y8saRQi2UQ7BO5wAdO8EXsWURXWFNVyP9g%2Bi%2Bxs4Ohjx7ZwlS9jH0fVUE3Ou%2FMwx4Hrp88NvQOH%2FRq1wcLrAu5FcTNLJHSLrPYF0xjIQ",
    },
  };

  const value = config.getConfig(req as FastifyRequest);
  t.deepEqual(
    {
      clientSecret: "foo",
      authorizeUrl: "https://example.com/authorize",
      tokenUrl: "https://example.com/token",
      refreshTokenUrl: "https://example.com/refresh",
      dataType: "json",
      basicAuthHeader: "Basic YmVlcw==",
    },
    value
  );
});
