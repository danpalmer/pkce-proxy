import { expect, test } from "bun:test";
import supertest from "supertest";

import { start, addHandler, getFakeServerUrl } from "./_fake-server";

test("serves", async () => {
  await start();

  const path = addHandler("POST", (req, res) => {
    return res.status(200).send();
  });

  await supertest("http://localhost:3123/").post(path).expect(200);
});

test("serves-error", async () => {
  await start();

  const path = addHandler("POST", (req, res) => {
    return res.status(451).send();
  });

  await supertest("http://localhost:3123/").post(path).expect(451);
});

test("serves-not-found", async () => {
  await start();
  await supertest("http://localhost:3123/").post("/unregistered").expect(404);
});

test("fake-server-url", () => {
  expect(getFakeServerUrl("test")).toEqual("http://localhost:3123/test");
});
