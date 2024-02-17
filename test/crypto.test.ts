import test from "ava";

import * as crypto from "../src/crypto";

test("round-trip", (t) => {
  const data = new Uint8Array([1, 2, 3, 4, 5]);
  const encoded = crypto.encrypt(data);
  const decoded = crypto.decrypt(encoded);
  t.deepEqual(data, decoded);
});
