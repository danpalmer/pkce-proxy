import { Session, SessionStorage } from "./types";
import { SESSION_MAX_SECONDS } from "../env";

export default class MemoryStorage implements SessionStorage {
  sessions: Partial<Record<string, Session>> = {};
  codes: Partial<Record<string, string>> = {};

  async get(state: string): Promise<Session | undefined> {
    return Promise.resolve(this.sessions[state]);
  }

  async getCode(code: string): Promise<string | undefined> {
    return Promise.resolve(this.codes[code]);
  }

  async set(state: string, session: Session) {
    this.sessions[state] = session;

    setTimeout(async () => {
      delete this.sessions[state];
    }, SESSION_MAX_SECONDS * 1000);
  }

  async setCode(code: string, session: Session) {
    this.codes[code] = session.state;
    this.sessions[session.state] = { ...session, code: code };

    setTimeout(async () => {
      delete this.sessions[session.state];
      delete this.codes[code];
    }, SESSION_MAX_SECONDS * 1000);
  }

  async delete(state: string) {
    const session = await this.get(state);
    if (!session) {
      return;
    }
    delete this.sessions[state];
    if (session.code) {
      delete this.codes[session.code];
    }
  }
}
