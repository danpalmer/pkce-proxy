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
        "uJa2LwQrRYYvC9%2BbYW3I8MNSLsxXDauV273Ybl0hzdKogJ8PVFOANPX5Iwz3gzsdvQyXQ0VWhWnzZnhkRqXFyITHUjk8aP%2B9aEpnJTHg1UEgN5IoDI9CZmnhk4RztplMXR2SjW2OMYXPc0xXXC0%3D",
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
