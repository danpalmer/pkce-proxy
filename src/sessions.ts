import crypto from "crypto";

import MemoryStorage from "./storage/memory";
import { Session } from "./storage/types";
import { REDIS_URL } from "./env";

const storage = REDIS_URL ? new MemoryStorage() : new MemoryStorage();

export function add(
  client_id: string,
  redirect_uri: string,
  state: string,
  pkce: { code_challenge: string; code_challenge_method: string }
) {
  storage.set(state, {
    client_id,
    redirect_uri,
    pkce,
    state,
    expiration: Date.now() + 500 * 1000,
  });

  setTimeout(() => {
    storage.delete(state);
  }, 500 * 1000);
}

export function addCode(code: string, session: Session) {
  storage.setCode(code, session);
}

export function find(code: string, code_verifier: string): Session | undefined {
  const state = storage.getCode(code);
  if (!state) return;

  const session = storage.get(state);

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

export function findByState(state: string) {
  return storage.get(state);
}

export function consume(session: Session) {
  storage.delete(session.state);
}

function base64_urlencode(str: string) {
  return Buffer.from(str)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
