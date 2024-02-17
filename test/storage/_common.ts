import test from "ava";

import { SessionStorage } from "../../src/storage/types";

export default function testStorage(storage: SessionStorage) {
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

  test("get-empty", async (t) => {
    t.is(await storage.get("missing"), undefined);
  });

  test("get-and-set-state", async (t) => {
    await storage.set("test-state", testSession);
    t.deepEqual(await storage.get("test-state"), testSession);
  });

  test("delete-missing", async (t) => {
    await storage.delete("missing");
    t.is(await storage.get("missing"), undefined);
  });

  test("delete-state", async (t) => {
    await storage.set("test-state", testSession);
    t.not(await storage.get("test-state"), undefined);
    await storage.delete("test-state");
    t.is(await storage.get("test-state"), undefined);
  });

  test("get-empty-code", async (t) => {
    t.is(await storage.getCode("missing"), undefined);
  });

  test("get-and-set-code", async (t) => {
    await storage.set("test-state", testSession);
    await storage.setCode("test-code", testSession);
    t.is(await storage.getCode("test-code"), "test-state");
    t.is((await storage.get("test-state"))?.code, "test-code");
  });

  test("delete-code", async (t) => {
    await storage.set("test-state", testSession);
    await storage.setCode("test-code", testSession);
    t.not(await storage.getCode("test-code"), undefined);
    await storage.delete("test-state");
    t.is(await storage.get("test-state"), undefined);
    t.is(await storage.getCode("test-state"), undefined);
  });
}
