import test from "ava";
import { randomUUID } from "crypto";

import { SessionStorage } from "../../src/storage/types.ts";

export default function testStorage(storage: SessionStorage) {
  test("get-empty", async (t) => {
    const missingKey = randomUUID();
    t.is(await storage.get(missingKey), undefined);
  });

  test("get-and-set-state", async (t) => {
    const testStateKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    t.deepEqual(await storage.get(testStateKey), session);
  });

  test("delete-missing", async (t) => {
    const missingKey = randomUUID();
    await storage.delete(missingKey);
    t.is(await storage.get(missingKey), undefined);
  });

  test("delete-state", async (t) => {
    const testStateKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    t.not(await storage.get(testStateKey), undefined);
    await storage.delete(testStateKey);
    t.is(await storage.get(testStateKey), undefined);
  });

  test("get-empty-code", async (t) => {
    const missingKey = randomUUID();
    t.is(await storage.getCode(missingKey), undefined);
  });

  test("get-and-set-code", async (t) => {
    const testStateKey = randomUUID();
    const testCodeKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    await storage.setCode(testCodeKey, session);
    t.is(await storage.getCode(testCodeKey), testStateKey);
    t.is((await storage.get(testStateKey))?.code, testCodeKey);
  });

  test("delete-code", async (t) => {
    const testStateKey = randomUUID();
    const testCodeKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    await storage.setCode(testCodeKey, session);
    t.not(await storage.getCode(testCodeKey), undefined);
    await storage.delete(testStateKey);
    t.is(await storage.get(testStateKey), undefined);
    t.is(await storage.getCode(testStateKey), undefined);
  });
}

const testSession = (state: string) => ({
  state,
  client_id: "test-client-id",
  redirect_uri: "test-redirect-uri",
  pkce: {
    code_challenge: "test-code-challenge",
    code_challenge_method: "test-code-challenge-method",
  },
  expiration: 0,
});
