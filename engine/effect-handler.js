class EffectHandler {
  constructor(name, handler = null) {
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Effect handler name is required"
      );
    }

    if (
      handler !== null &&
      typeof handler !== "function"
    ) {
      throw new Error(
        "Effect handler must be a function"
      );
    }

    this.name = name;
    this.handler = handler;
  }

  setHandler(handler) {
    if (typeof handler !== "function") {
      throw new Error(
        "Effect handler must be a function"
      );
    }

    this.handler = handler;

    return this;
  }

  execute(context = {}) {
    if (!this.handler) {
      throw new Error(
        `Effect handler is not configured: ${this.name}`
      );
    }

    return this.handler(context);
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectHandler;
}
