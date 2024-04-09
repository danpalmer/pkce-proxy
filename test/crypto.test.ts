import { expect, test } from "bun:test";

import * as crypto from "../src/crypto";

test("round-trip", () => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = crypto.encrypt(data);
  const decoded = crypto.decrypt(encoded);
  expect(decoded).toEqual(data);
});
