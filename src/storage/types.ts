export type Session = {
  client_id: any;
  redirect_uri: any;
  state: any;
  pkce: { code_challenge: any; code_challenge_method: any };
  code?: any;
  expiration: number;
};

export interface SessionStorage {
  get(state: string): Session;
  getCode(code: string): string;
  set(state: string, session: Session): void;
  setCode(code: string, state: Session): void;
  delete(state: string): void;
}
