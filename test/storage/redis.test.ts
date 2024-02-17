import test from "ava";

import RedisStorage from "../../src/storage/redis";
import testStorage from "./_common";

if (process.env.REDIS_URL) {
  const storage = new RedisStorage(process.env.REDIS_URL);
  testStorage(storage);
} else {
  test.todo("redis");
}
