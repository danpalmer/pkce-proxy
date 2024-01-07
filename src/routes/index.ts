import type { FastifyRequest, FastifyReply } from "fastify";

export default async function index(req: FastifyRequest, res: FastifyReply) {
  res.header("Content-Type", "text/html");
  res.send(`
    <titl>OAuth PKCE Proxy</titl>
    <h1>OAuth PKCE Proxy</h1>
    <p>This server is required to allow Raycast to connect to services that do not support the PKCE OAuth flow (which is the most secure one for applications). Ideally, this proxy should not be needed but until more services get up to speed with the latest security recommendations, this is the state that we are in.</p>
    <p><b>No data is stored in the server.</b> In fact, it doesn't even have a database.</p>
    <p>See <a href="https://github.com/mathieudutour/pkce-proxy">https://github.com/mathieudutour/pkce-proxy</a> for more details.</p>
`);
}
