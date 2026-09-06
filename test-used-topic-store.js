const fs = require("fs");
const path = require("path");
const UsedTopicStore = require("./engine/used-topic-store");

const testFile = "./lab/topics/test-used-topics.json";

if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
}

console.log("===== USED TOPIC STORE TEST =====");

const store = new UsedTopicStore(testFile);

console.log("INITIAL:", store.list());

const topic1 = {
  id: "earth-stops-rotating",
  title: "What If Earth Suddenly Stopped Rotating?"
};

const topic2 = {
  id: "moon-disappears",
  title: "What If the Moon Suddenly Disappeared?"
};

console.log("\n===== ADD TOPICS =====");

console.log("ADD 1:", store.add(topic1));
console.log("ADD 2:", store.add(topic2));

console.log("\nSTORED:", store.list());

console.log("\n===== DUPLICATE TEST =====");

console.log(
  "HAS earth-stops-rotating:",
  store.has("earth-stops-rotating")
);

console.log(
  "ADD DUPLICATE:",
  store.add(topic1)
);

console.log(
  "COUNT:",
  store.list().length
);

console.log("\n===== PERSISTENCE TEST =====");

const store2 = new UsedTopicStore(testFile);

console.log(
  "NEW INSTANCE HAS EARTH:",
  store2.has("earth-stops-rotating")
);

console.log(
  "NEW INSTANCE HAS MOON:",
  store2.has("moon-disappears")
);

console.log(
  "PERSISTED COUNT:",
  store2.list().length
);

if (
  store2.has("earth-stops-rotating") &&
  store2.has("moon-disappears") &&
  store2.list().length === 2 &&
  store2.add(topic1) === false
) {
  console.log("\nUSED TOPIC STORE: OK");
} else {
  console.log("\nUSED TOPIC STORE: FAILED");
  process.exit(1);
}

fs.unlinkSync(testFile);
