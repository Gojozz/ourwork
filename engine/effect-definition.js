class EffectDefinition {
  constructor(options = {}) {
    if (
      typeof options.name !== "string" ||
      !options.name.trim()
    ) {
      throw new Error(
        "Effect definition name is required"
      );
    }

    if (
      typeof options.domain !== "string" ||
      !options.domain.trim()
    ) {
      throw new Error(
        "Effect definition domain is required"
      );
    }

    if (
      typeof options.description !== "string" ||
      !options.description.trim()
    ) {
      throw new Error(
        "Effect definition description is required"
      );
    }

    if (
      options.handler &&
      typeof options.handler.execute !== "function"
    ) {
      throw new Error(
        "Effect definition handler is invalid"
      );
    }

    this.name =
      options.name.trim();

    this.domain =
      options.domain.trim();

    this.description =
      options.description.trim();

    this.handler =
      options.handler || null;

    this.metadata = {
      ...(options.metadata || {})
    };
  }

  hasHandler() {
    return (
      !!this.handler &&
      typeof this.handler.execute ===
        "function"
    );
  }

  execute(context = {}) {
    if (!this.hasHandler()) {
      throw new Error(
        `Effect handler is not configured: ${this.name}`
      );
    }

    return this.handler.execute(
      context
    );
  }

  toJSON() {
    return {
      name: this.name,
      domain: this.domain,
      description: this.description,
      metadata: {
        ...this.metadata
      }
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectDefinition;
}
