import { expect, test } from "bun:test";

import * as config from "../src/client-config";
import { FastifyRequest } from "fastify";

test("round-trip-full", () => {
  const value: config.ClientConfig = {
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    refreshTokenUrl: "https://example.com/refresh",
    dataType: "json",
    authHeader: "Basic YmVlcw==",
  };

  const encoded = config.encode(value);
  const decoded = config.decode(encoded);
  expect(decoded).toEqual(value);
});

test("round-trip-minimal", () => {
  const value: config.ClientConfig = {
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    dataType: "json",
  };

  const encoded = config.encode(value);
  const decoded = config.decode(encoded);
  expect(decoded).toEqual(value);
});

test("request-config-full-v1", () => {
  // Warning: This test ensures backwards compatibility. If you need to change
  // this test you have most likely broken backwards compatibility. When adding
  // a new optional field, new tests should be added instead, with the v1 suffix
  // and existing tests should be kept as-is.
  const req = {
    params: {
      clientToken:
        "ZE7ps9vn1HOC3k1voue4kUygDCOBVckKRVkjHM4iDmQuAlUP1eY3RL050rV%2BN9tP9yEeskpGhFANzmc7SlKIH7HViYjF7l78thvS3VmA90h2bIJd8%2BnCQmcts9W2RR7L5UPYTkAWTGhrs2FnmRaOYxplU3Fr",
    },
  };

  const [value, error] = config.getConfig(req as FastifyRequest, {} as any);
  expect(value).toEqual({
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    refreshTokenUrl: "https://example.com/refresh",
    dataType: "json",
    authHeader: "Basic YmVlcw==",
  });
  expect(error).toBeUndefined();
});

test("request-config-minimal-v1", () => {
  // Warning: This test ensures backwards compatibility. If you need to change
  // this test you have most likely broken backwards compatibility. When adding
  // a new optional field, new tests should be added instead, with the v1 suffix
  // and existing tests should be kept as-is.
  const req = {
    params: {
      clientToken:
        "AeBfphzM2LnQ%2FTK5c%2BoW8TtnenZaAR8n6EliLNiBiIMNeOkc%2F%2BWJvizsdw%2FM1qQINdRenbVqcRFGkChzO45wjeGan6ie2PiZh6SbIc1Rz%2FRP2DFH%2F15TnoszzLLd",
    },
  };

  const [value, error] = config.getConfig(req as FastifyRequest, {} as any);
  expect(value).toEqual({
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    dataType: "json",
  });
  expect(error).toBeUndefined();
});
