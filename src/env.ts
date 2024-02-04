export const PORT = parseInt(process.env.PORT || "5000");
export const HOST = process.env.HOST || "0.0.0.0";
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

export const PROXY_HOSTNAME = process.env.PROXY_HOSTNAME as string;
if (!PROXY_HOSTNAME) {
  throw new Error("PROXY_HOSTNAME env variable is not set");
}

export const PROXY_REDIRECT_URL = `${PROXY_HOSTNAME}/redirect`;

export const SECRET_KEY = process.env.SECRET_KEY as string;
if (!SECRET_KEY) {
  throw new Error("SECRET_KEY env variable is not set");
}

export const REDIS_URL = process.env.REDIS_URL;
