import test from "ava";
import supertest from "supertest";

import { server } from "../../src/server";

test("serves", async (t) => {
  await server.ready();
  await supertest(server.server)
    .get("/")
    .expect(200)
    .expect("Content-Type", "text/html; charset=UTF-8");
  t.pass();
});
