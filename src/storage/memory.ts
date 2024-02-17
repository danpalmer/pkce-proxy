import { Session, SessionStorage } from "./types";

export default class MemoryStorage implements SessionStorage {
  sessions: Partial<Record<string, Session>> = {};
  codes: Partial<Record<string, string>> = {};

  get(state: string): Session | undefined {
    return this.sessions[state];
  }

  getCode(code: string): string | undefined {
    return this.codes[code];
  }

  set(state: string, session: Session): void {
    this.sessions[state] = session;
  }

  setCode(code: string, session: Session): void {
    this.codes[code] = session.state;
    this.sessions[session.state] = { ...session, code: code };
  }

  delete(state: string): void {
    const session = this.get(state);
    if (!session) {
      return;
    }
    delete this.sessions[state];
    if (session.code) {
      delete this.codes[session.code];
    }
  }
}
