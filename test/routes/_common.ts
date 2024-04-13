import { encode } from "../../src/client-config";

export interface ConfigOverrides {
  clientSecret?: string;
  authorizeUrl?: string;
  tokenUrl?: string;
  refreshTokenUrl?: string;
  dataType?: "json" | "form";
  basicAuthHeader?: string;
}

export const CLIENT_ID = "DC207A4D-4E83-433D-8C00-64E27A91E072";
export const CLIENT_SECRET =
  "ieZ4saiPeeshoh2ru9Neiph6jo8eicaesh3Xoo9re5fong3chiedee4noiz3mo3h";
export const AUTHORIZE_URL = "https://api.example.com/oauth/authorize";
export const TOKEN_URL = "https://api.example.com/oauth/token";
export const REFRESH_TOKEN_URL = "https://api.example.com/oauth/refresh";
export const DATA_TYPE = "json";
export const CLIENT_REDIRECT_URL = "https://client.example.com/redirect";
export const TEST_STATE = "ED29ED15-6367-4389-9E08-A87800DA33B3";
export const CODE = "test-code";
export const CODE_CHALLENGE = "dGVzdC1jb2RlLXZlcmlmaWVy";
export const CODE_CHALLENGE_METHOD = "plain";
export const CODE_VERIFIER = "test-code-verifier";

export function createToken(overrides: ConfigOverrides = {}): string {
  return encode({
    clientSecret: overrides.clientSecret || CLIENT_SECRET,
    authorizeUrl: overrides.authorizeUrl || AUTHORIZE_URL,
    tokenUrl: overrides.tokenUrl || TOKEN_URL,
    refreshTokenUrl: overrides.refreshTokenUrl || REFRESH_TOKEN_URL,
    dataType: overrides.dataType || DATA_TYPE,
    basicAuthHeader: overrides.basicAuthHeader,
  });
}
