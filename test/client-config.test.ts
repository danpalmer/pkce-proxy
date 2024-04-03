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

test("round-trip-minimal", (t) => {
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

test("request-config-full-v1", (t) => {
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

test("request-config-minimal-v1", (t) => {
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

  const value = config.getConfig(req as FastifyRequest);
  t.deepEqual(
    {
      clientSecret: "foo",
      authorizeUrl: "https://example.com/authorize",
      tokenUrl: "https://example.com/token",
      dataType: "json",
    },
    value
  );
});
