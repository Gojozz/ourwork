class EffectHandlerRegistry {
  constructor() {
    this.handlers = new Map();
  }

  register(handler) {
    if (!handler) {
      throw new Error(
        "Effect handler is required"
      );
    }

    if (
      typeof handler.name !== "string" ||
      !handler.name.trim()
    ) {
      throw new Error(
        "Effect handler must have a name"
      );
    }

    if (
      typeof handler.execute !== "function"
    ) {
      throw new Error(
        `Invalid effect handler: ${handler.name}`
      );
    }

    if (this.handlers.has(handler.name)) {
      throw new Error(
        `Effect handler already registered: ${handler.name}`
      );
    }

    this.handlers.set(
      handler.name,
      handler
    );

    return this;
  }

  has(name) {
    return this.handlers.has(name);
  }

  get(name) {
    return this.handlers.get(name) || null;
  }

  execute(name, context = {}) {
    const handler =
      this.get(name);

    if (!handler) {
      throw new Error(
        `Effect handler not found: ${name}`
      );
    }

    return handler.execute(context);
  }

  list() {
    return [
      ...this.handlers.values()
    ];
  }

  names() {
    return [
      ...this.handlers.keys()
    ];
  }

  clear() {
    this.handlers.clear();
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectHandlerRegistry;
}
