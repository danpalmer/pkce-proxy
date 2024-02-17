export type Session = {
  client_id: string;
  redirect_uri: string;
  state: string;
  pkce: { code_challenge: string; code_challenge_method: string };
  code?: string;
  expiration: number;
};

export interface SessionStorage {
  get(state: string): Promise<Session | undefined>;
  getCode(code: string): Promise<string | undefined>;
  set(state: string, session: Session): Promise<void>;
  setCode(code: string, state: Session): Promise<void>;
  delete(state: string): Promise<void>;
}
