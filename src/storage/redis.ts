import * as redis from "redis";

import { Session, SessionStorage } from "./types";

type RedisClient = redis.RedisClientType<
  redis.RedisModules,
  redis.RedisFunctions,
  redis.RedisScripts
>;

export default class RedisStorage implements SessionStorage {
  client: Promise<RedisClient>;

  constructor(redisUrl: string) {
    this.client = redis.createClient({ url: redisUrl }).connect();
  }

  async get(state: string): Promise<Session | undefined> {
    const client = await this.client;
    const data = await client.get(`session:${state}`);
    return data && JSON.parse(data);
  }

  async getCode(code: string): Promise<string | undefined> {
    const client = await this.client;
    const state = client.get(`code:${code}`);
    return state && state.toString();
  }

  async set(state: string, session: Session) {
    const client = await this.client;
    await client.set(`session:${state}`, JSON.stringify(session));
  }

  async setCode(code: string, session: Session) {
    const client = await this.client;
    await client.set(`code:${code}`, session.state);
    await client.set(
      `session:${session.state}`,
      JSON.stringify({ ...session, code: code })
    );
  }

  async delete(state: string) {
    const client = await this.client;
    const session = await this.get(state);
    if (!session) {
      return;
    }
    await client.del(`session:${state}`);
    if (session.code) {
      await client.del(`code:${session.code}`);
    }
  }
}
