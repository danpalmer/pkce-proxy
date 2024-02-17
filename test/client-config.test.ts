import test from "ava";

import * as config from "../src/client-config";
import { FastifyRequest } from "fastify";

test("round-trip", (t) => {
  const value: config.ClientConfig = {
    clientSecret: "foo",
    authorizeUrl: "https://example.com/authorize",
    tokenUrl: "https://example.com/token",
    refreshTokenUrl: "https://example.com/refresh",
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
        "lmbDoAyRz2GbekrRKcU88mIVMsQ7h3tUl2TwqDlsNWH2VzrNnG6TCRFRmLHS06xyVOuIzvMjxZuHR91fjr35WuxttNn5AqADxQE24wz96hGCnN43zmNC%2BYgsN8J60SKnrbN2V5uU10j298WsWWA%3D",
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
    },
    value
  );
});
