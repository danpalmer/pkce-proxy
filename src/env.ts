export const PROXY_HOSTNAME = process.env.PROXY_HOSTNAME as string;
if (!PROXY_HOSTNAME) {
  throw new Error("PROXY_HOSTNAME env variable is not set");
}

export const PROXY_REDIRECT_URL = `${PROXY_HOSTNAME}/redirect`;

export const TOKEN_URL = process.env.TOKEN_URL as string;
if (!TOKEN_URL) {
  throw new Error("TOKEN_URL env variable is not set");
}

export const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
if (!CLIENT_SECRET) {
  throw new Error("CLIENT_SECRET env variable is not set");
}

export const AUTHORIZE_URL = process.env.AUTHORIZE_URL as string;
if (!AUTHORIZE_URL) {
  throw new Error("AUTHORIZE_URL env variable is not set");
}

export const REFRESH_TOKEN_URL = (process.env.REFRESH_TOKEN_URL ||
  process.env.TOKEN_URL) as string;
if (!REFRESH_TOKEN_URL) {
  throw new Error("REFRESH_TOKEN_URL env variable is not set");
}

export const JSON_OR_FORM = (process.env.JSON_OR_FORM || "json") as
  | "json"
  | "form";
if (JSON_OR_FORM !== "json" && JSON_OR_FORM !== "form") {
  throw new Error(
    "JSON_OR_FORM env variable has to be either `json` or `form`"
  );
}

export const ENVIRONMENT = (process.env.NODE_ENV || "development") as
  | "development"
  | "production"
  | "test";
if (
  ENVIRONMENT !== "development" &&
  ENVIRONMENT !== "production" &&
  ENVIRONMENT !== "test"
) {
  throw new Error(
    "ENVIRONMENT env variable has to be either `development`, `production` or `test`"
  );
}

export const PORT = parseInt(process.env.PORT || "5000");
export const HOST = process.env.HOST || "0.0.0.0";

export const SECRET_KEY = process.env.SECRET_KEY as string;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY env variable is not set");
}
