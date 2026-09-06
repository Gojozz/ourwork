const fs = require("fs");
const path = require("path");

class UsedTopicStore {
  constructor(filePath = "./lab/topics/used-topics.json") {
    this.filePath = filePath;
    this.ensureFile();
  }

  ensureFile() {
    const dir = path.dirname(this.filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]\n", "utf8");
    }
  }

  load() {
    this.ensureFile();

    const raw = fs.readFileSync(this.filePath, "utf8").trim();

    if (!raw) return [];

    const data = JSON.parse(raw);

    if (!Array.isArray(data)) {
      throw new Error("Used topic store must contain an array");
    }

    return data;
  }

  save(topics) {
    if (!Array.isArray(topics)) {
      throw new Error("Topics must be an array");
    }

    fs.writeFileSync(
      this.filePath,
      JSON.stringify(topics, null, 2) + "\n",
      "utf8"
    );

    return this;
  }

  has(topic) {
    const id = typeof topic === "string"
      ? topic
      : topic && topic.id;

    if (!id) return false;

    return this.load().some(item => item.id === id);
  }

  add(topic) {
    if (!topic || typeof topic !== "object" || !topic.id) {
      throw new Error("Topic with id is required");
    }

    const topics = this.load();

    if (topics.some(item => item.id === topic.id)) {
      return false;
    }

    topics.push({
      id: topic.id,
      title: topic.title || "",
      usedAt: new Date().toISOString()
    });

    this.save(topics);

    return true;
  }

  list() {
    return this.load();
  }

  clear() {
    this.save([]);
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports = UsedTopicStore;
}
