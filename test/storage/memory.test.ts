import test from "ava";

import MemoryStorage from "../../src/storage/memory";
import testStorage from "./_common";

const storage = new MemoryStorage();
testStorage(storage);
