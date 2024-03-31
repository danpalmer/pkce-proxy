import Redis from "ioredis";

import { Session, SessionStorage } from "./types";
import { SESSION_MAX_SECONDS } from "../env";

export default class RedisStorage implements SessionStorage {
  client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl);
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
      SESSION_MAX_SECONDS
    );
  }

  async setCode(code: string, session: Session) {
    await this.client.set(
      `code:${code}`,
      session.state,
      "EX",
      SESSION_MAX_SECONDS
    );
    await this.client.set(
      `session:${session.state}`,
      JSON.stringify({ ...session, code: code }),
      "EX",
      SESSION_MAX_SECONDS
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
