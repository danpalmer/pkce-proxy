import { expect, test } from "bun:test";
import { randomUUID } from "crypto";

import { SESSION_MAX_MS } from "../../src/env";
import { SessionStorage } from "../../src/storage/types";

export default function testStorage(storage: SessionStorage) {
  test("get-empty", async () => {
    const missingKey = randomUUID();
    expect(await storage.get(missingKey)).toBeUndefined();
  });

  test("get-and-set-state", async () => {
    const testStateKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    expect(await storage.get(testStateKey)).toEqual(session);
  });

  test("delete-missing", async () => {
    const missingKey = randomUUID();
    await storage.delete(missingKey);
    expect(await storage.get(missingKey)).toBeUndefined();
  });

  test("delete-state", async () => {
    const testStateKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    expect(await storage.get(testStateKey)).not.toBeUndefined();
    await storage.delete(testStateKey);
    expect(await storage.get(testStateKey)).toBeUndefined();
  });

  test("get-empty-code", async () => {
    const missingKey = randomUUID();
    expect(await storage.getCode(missingKey)).toBeUndefined();
  });

  test("get-and-set-code", async () => {
    const testStateKey = randomUUID();
    const testCodeKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    await storage.setCode(testCodeKey, session);
    expect(await storage.getCode(testCodeKey)).toEqual(testStateKey);
    expect((await storage.get(testStateKey))?.code).toEqual(testCodeKey);
  });

  test("delete-code", async () => {
    const testStateKey = randomUUID();
    const testCodeKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    await storage.setCode(testCodeKey, session);
    expect(await storage.getCode(testCodeKey)).not.toBeUndefined();
    await storage.delete(testStateKey);
    expect(await storage.get(testStateKey)).toBeUndefined();
    expect(await storage.getCode(testStateKey)).toBeUndefined();
  });

  test("expiry", async () => {
    const testStateKey = randomUUID();
    const testCodeKey = randomUUID();
    const session = testSession(testStateKey);
    await storage.set(testStateKey, session);
    await storage.setCode(testCodeKey, session);

    await new Promise((resolve) => setTimeout(resolve, 1050));

    expect(await storage.getCode(testCodeKey)).toBeUndefined();
    expect((await storage.get(testStateKey))?.code).toBeUndefined();
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
