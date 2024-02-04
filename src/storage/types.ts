export type Session = {
  client_id: string;
  redirect_uri: string;
  state: string;
  pkce: { code_challenge: string; code_challenge_method: string };
  code?: string;
  expiration: number;
};

export interface SessionStorage {
  get(state: string): Session;
  getCode(code: string): string;
  set(state: string, session: Session): void;
  setCode(code: string, state: Session): void;
  delete(state: string): void;
}
