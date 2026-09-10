const EffectHandler =
  require("./effect-handler");

class EffectRegistry {
  constructor() {
    this.effects = new Map();
  }

  register(name, metadata = {}) {
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Effect name is required"
      );
    }

    if (this.effects.has(name)) {
      throw new Error(
        `Effect already registered: ${name}`
      );
    }

    const handler =
      metadata.handler instanceof EffectHandler
        ? metadata.handler
        : null;

    this.effects.set(name, {
      name,
      ...metadata,
      handler
    });

    return this;
  }

  has(name) {
    return this.effects.has(name);
  }

  get(name) {
    return this.effects.get(name) || null;
  }

  execute(name, context = {}) {
    const effect =
      this.get(name);

    if (!effect) {
      throw new Error(
        `Unregistered effect: ${name}`
      );
    }

    if (
      !effect.handler ||
      typeof effect.handler.execute !== "function"
    ) {
      throw new Error(
        `Effect handler is not configured: ${name}`
      );
    }

    return effect.handler.execute(
      context
    );
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
