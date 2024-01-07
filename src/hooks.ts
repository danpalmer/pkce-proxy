import type {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from "fastify";

import { IS_PROD } from "./constants";

export default function addSecurityHeaders(
  req: FastifyRequest,
  res: FastifyReply,
  done: HookHandlerDoneFunction
) {
  // If prod and not HTTPs, redirect and end.
  if (IS_PROD && req.headers["x-forwarded-proto"] !== "https") {
    res.redirect(302, "https://" + req.hostname + req.originalUrl);
    return done();
  }

  // If prod, enable HSTS so that this only ever works on HTTPS.
  if (IS_PROD) {
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
}
