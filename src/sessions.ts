import crypto from "crypto";

import MemoryStorage from "./storage/memory.ts";
import RedisStorage from "./storage/redis.ts";
import { Session } from "./storage/types.ts";
import { REDIS_URL } from "./env.ts";

const storage = REDIS_URL ? new RedisStorage(REDIS_URL) : new MemoryStorage();

export async function add(
  client_id: string,
  redirect_uri: string,
  state: string,
  pkce: { code_challenge: string; code_challenge_method: string }
) {
  await storage.set(state, {
    client_id,
    redirect_uri,
    pkce,
    state,
    expiration: Date.now() + 500 * 1000,
  });

  setTimeout(async () => {
    await storage.delete(state);
  }, 500 * 1000);
}

export async function addCode(code: string, session: Session) {
  await storage.setCode(code, session);
}

export async function find(
  code: string,
  code_verifier: string
): Promise<Session | undefined> {
  const state = await storage.getCode(code);
  if (!state) return;

  const session = await storage.get(state);

  if (
    session &&
    (session.pkce.code_challenge_method === "plain"
      ? session.pkce.code_challenge === base64_urlencode(code_verifier)
      : session.pkce.code_challenge ===
        crypto
          .createHash("sha256")
          .update(code_verifier)
          .digest("base64")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, ""))
  ) {
    return session;
  }
}

export async function findByState(state: string): Promise<Session | undefined> {
  return await storage.get(state);
}

export async function consume(session: Session) {
  await storage.delete(session.state);
}

function base64_urlencode(str: string) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
