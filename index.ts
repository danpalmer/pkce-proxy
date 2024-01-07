import fastify from "fastify";

import authorize from "./src/routes/authorize";
import token from "./src/routes/token";
import refreshToken from "./src/routes/refresh-token";
import redirect from "./src/routes/redirect";
import index from "./src/routes/index";

const PORT = parseInt(process.env.PORT || "5000");
const HOST = process.env.HOST || "0.0.0.0";
const PROD = process.env.NODE_ENV?.startsWith("prod") || false;

const server = fastify();

server.addHook("onRequest", (req, res, done) => {
  // If prod and not HTTPs, redirect and end.
  if (PROD && req.headers["x-forwarded-proto"] !== "https") {
    res.redirect(302, "https://" + req.hostname + req.originalUrl);
    return done();
  }

  // If prod, enable HSTS so that this only ever works on HTTPS.
  if (PROD) {
    res.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Basic security headers to ensure we're not being misused
  res.header(
    "Content-Security-Policy",
    "default-src 'none'; base-uri 'none'; object-src 'none'; form-action 'none'; frame-ancestors 'none'; require-trusted-types-for 'script';"
  );
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "no-referrer");

  return done();
});

server
  .get("/", index)
  .get("/authorize", authorize)
  .get("/redirect", redirect)
  .post("/token", token)
  .post("/refresh-token", refreshToken);

const start = async () => {
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`started listening on ${HOST}:${PORT}`);
  } catch (err) {
    console.error(err);
    server.log.error(err);
    process.exit(1);
  }
};
start();
