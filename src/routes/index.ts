import type { FastifyRequest, FastifyReply } from "fastify";

export default function index(req: FastifyRequest, res: FastifyReply) {
  res.sendFile("index.html");
}
