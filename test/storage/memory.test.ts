import test from "ava";

import MemoryStorage from "../../src/storage/memory";

const storage = new MemoryStorage();

const testSession = {
  client_id: "test-client-id",
  redirect_uri: "test-redirect-uri",
  state: "test-state",
  pkce: {
    code_challenge: "test-code-challenge",
    code_challenge_method: "test-code-challenge-method",
  },
  expiration: 0,
};

test("get-empty", (t) => {
  t.is(storage.get("missing"), undefined);
});

test("get-and-set-state", (t) => {
  storage.set("test-state", testSession);
  t.deepEqual(storage.get("test-state"), testSession);
});

test("delete-missing", (t) => {
  storage.delete("missing");
  t.is(storage.get("missing"), undefined);
});

test("delete-state", (t) => {
  storage.set("test-state", testSession);
  t.not(storage.get("test-state"), undefined);
  storage.delete("test-state");
  t.is(storage.get("test-state"), undefined);
});

test("get-empty-code", (t) => {
  t.is(storage.getCode("missing"), undefined);
});

test("get-and-set-code", (t) => {
  storage.set("test-state", testSession);
  storage.setCode("test-code", testSession);
  t.is(storage.getCode("test-code"), "test-state");
  t.is(storage.get("test-state")?.code, "test-code");
});

test("delete-code", (t) => {
  storage.set("test-state", testSession);
  storage.setCode("test-code", testSession);
  t.not(storage.getCode("test-code"), undefined);
  storage.delete("test-state");
  t.is(storage.get("test-state"), undefined);
  t.is(storage.getCode("test-state"), undefined);
});
