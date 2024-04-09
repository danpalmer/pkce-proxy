import { test } from "bun:test";

import MemoryStorage from "../../src/storage/memory";
import testStorage from "./_common";

const storage = new MemoryStorage();
testStorage(storage);

// Placeholder, Bun test requires at least one test statically defined.
test("placeholder", () => {});
