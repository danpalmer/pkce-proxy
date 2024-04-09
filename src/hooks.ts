import type {
  FastifyRequest,
  FastifyReply,
  HookHandlerDoneFunction,
} from "fastify";

import { ENVIRONMENT } from "./env";

export default function addSecurityHeaders(
  req: FastifyRequest,
  res: FastifyReply,
  done: HookHandlerDoneFunction
) {
  const isDevelopment = ENVIRONMENT === "development";

  // If not dev and not HTTPs, redirect and end.
  if (!isDevelopment && req.headers["x-forwarded-proto"] !== "https") {
    res.redirect(302, "https://" + req.hostname + req.originalUrl);
    return done();
  }

  // If not dev, enable HSTS so that this only ever works on HTTPS.
  if (!!isDevelopment) {
    res.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  // Basic security headers to ensure we're not being misused
  res.header(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      "base-uri 'none'",
      "object-src 'none'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "require-trusted-types-for 'script'",
      "style-src 'self' 'unsafe-inline'",
    ].join("; ")
  );
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "no-referrer");

  return done();
}
