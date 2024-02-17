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
        "Ts%2BsuK0DB8silP3zDv%2B15Kyi6VSQddbtAGJnPs39gJcZXsahHDbHkkTSg1HUe93BN6fEQuqqdCavJ%2FFWELtXSBCmjZntEESCbWaoRyVUwLW%2Bi2c%2BobJGrg%2BtIahYExx2tw59VGhHRFKUA52HJ%2BXgONhSqqdeHvVLGKiihjc%2BGdnYuhvssIMf7lpOsaqlCsDm%2BA%3D%3D",
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
