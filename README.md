# PKCE Proxy for Raycast

A multi-tenant proxy to enable the OAuth PKCE flow for providers that do not
support PKCE.

## Configuration

Configuration for specific providers is provided to the web application and a new
set of proxy URLs to use is returned. These contain the necessary configuration.

The server-side configuration is provided in environment variables:

**Required**

```
PROXY_HOSTNAME=https://your-proxy-domain
SECRET_KEY=<a long random value>
```

The `SECRET_KEY` is used to encrypt configuration values. It's important that it
is long an unpredictable. A good key can be generated with
`pwgen --secure 100 1`.

**Optional (defaults shown)**

```
PORT=5000
HOST=0.0.0.0
NODE_ENV=development # production, test
PROXY_REDIRECT_URL=https://your-proxy-domain/redirect
REDIS_URL= # redis:// URL to use Redis for storage
```

pkce-proxy requires short-term storage to serve correct flows. Currently sessions
are configured with a 5 minute expiry, meaning that a login flow initiated by a
user must complete within 5 minutes or the data for it will be purged.

This temporary storage can complicate deployment as by default session data is
only stored in memory in the running Node process. Multi-process/multi-server
deployments, or server restarts will therefore create sessions that won't always
work. If a `REDIS_URL` is provided, pkce-proxy will use that Redis instance to
store this temporary data instead, making scale-out and re-deployment easier.

## Running Locally

```sh
bun install
scripts/build
scripts/test
scripts/run
```

The proxy should now be running on [localhost:5000](http://localhost:5000/).
`pkce-proxy` is designed to run under Bun for simplicity.

## Contributions

Thanks to @mathieudutour for creating
https://github.com/mathieudutour/pkce-proxy. This project builds on its
foundations to add multi-tenancy, self-service setup, Redis persistence, and
more.

Contributions are welcome, particularly those around OAuth compatibility, error
messages and user (developer) experience, and metrics.
