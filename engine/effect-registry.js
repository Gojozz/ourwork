class EffectRegistry {
  constructor() {
    this.effects = new Map();
  }

  register(name, metadata = {}) {
    if (typeof name !== "string" || !name.trim()) {
      throw new Error("Effect name is required");
    }

    if (this.effects.has(name)) {
      throw new Error(`Effect already registered: ${name}`);
    }

    this.effects.set(name, {
      name,
      ...metadata
    });

    return this;
  }

  has(name) {
    return this.effects.has(name);
  }

  get(name) {
    return this.effects.get(name) || null;
  }

  list() {
    return [...this.effects.values()];
  }

  names() {
    return [...this.effects.keys()];
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectRegistry;
}
