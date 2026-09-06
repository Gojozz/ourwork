class TopicEngine {

  constructor(options = {}) {
    this.topics = [];
    this.used = new Set();

    this.weights = {
      curiosity: 0.30,
      visual: 0.25,
      shortForm: 0.20,
      novelty: 0.15,
      educational: 0.10,
      ...options.weights
    };
  }


  add(topic) {

    if (!topic || typeof topic !== "object") {
      throw new Error("Invalid topic");
    }

    if (
      typeof topic.id !== "string" ||
      !topic.id.trim()
    ) {
      throw new Error("Topic id is required");
    }

    if (
      typeof topic.title !== "string" ||
      !topic.title.trim()
    ) {
      throw new Error("Topic title is required");
    }

    if (this.topics.some(t => t.id === topic.id)) {
      return false;
    }

    this.topics.push({
      ...topic,
      score: this.score(topic)
    });

    return true;
  }


  addMany(topics = []) {

    if (!Array.isArray(topics)) {
      throw new Error("Topics must be an array");
    }

    let added = 0;

    for (const topic of topics) {
      if (this.add(topic)) {
        added++;
      }
    }

    return added;
  }


  score(topic) {

    const values = {
      curiosity: Number(topic.curiosity) || 0,
      visual: Number(topic.visual) || 0,
      shortForm: Number(topic.shortForm) || 0,
      novelty: Number(topic.novelty) || 0,
      educational: Number(topic.educational) || 0
    };

    return (
      values.curiosity * this.weights.curiosity +
      values.visual * this.weights.visual +
      values.shortForm * this.weights.shortForm +
      values.novelty * this.weights.novelty +
      values.educational * this.weights.educational
    );
  }


  rank() {

    return [...this.topics]
      .filter(topic => !this.used.has(topic.id))
      .sort((a, b) => b.score - a.score);
  }


  next() {

    const ranked = this.rank();

    if (!ranked.length) {
      return null;
    }

    const topic = ranked[0];

    this.used.add(topic.id);

    return topic;
  }


  markUsed(id) {

    if (typeof id !== "string") {
      return false;
    }

    this.used.add(id);

    return true;
  }


  resetUsed() {
    this.used.clear();
  }


  remaining() {
    return this.rank().length;
  }


  list() {
    return [...this.topics];
  }
}


if (typeof module !== "undefined") {
  module.exports = TopicEngine;
}
