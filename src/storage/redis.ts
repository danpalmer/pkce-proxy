import Redis from "ioredis";

import { Session, SessionStorage } from "./types";
import { SESSION_MAX_MS } from "../env";

export default class RedisStorage implements SessionStorage {
  client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, { family: 6 });
  }

  async get(state: string): Promise<Session | undefined> {
    const data = await this.client.get(`session:${state}`);
    return (data && JSON.parse(data)) || undefined;
  }

  async getCode(code: string): Promise<string | undefined> {
    const state = await this.client.get(`code:${code}`);
    return (state && state.toString()) || undefined;
  }

  async set(state: string, session: Session) {
    await this.client.set(
      `session:${state}`,
      JSON.stringify(session),
      "EX",
      Math.max(Math.floor(SESSION_MAX_MS / 1000), 1)
    );
  }

  async setCode(code: string, session: Session) {
    await this.client.set(
      `code:${code}`,
      session.state,
      "EX",
      Math.max(Math.floor(SESSION_MAX_MS / 1000), 1)
    );
    await this.client.set(
      `session:${session.state}`,
      JSON.stringify({ ...session, code: code }),
      "EX",
      Math.max(Math.floor(SESSION_MAX_MS / 1000), 1)
    );
  }

  async delete(state: string) {
    const session = await this.get(state);
    if (!session) {
      return;
    }
    await this.client.del(`session:${state}`);
    if (session.code) {
      await this.client.del(`code:${session.code}`);
    }
  }
}
