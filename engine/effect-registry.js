const EffectHandler =
  require("./effect-handler");

const EffectDefinition =
  require("./effect-definition");

class EffectRegistry {
  constructor() {
    this.effects = new Map();
  }

  register(name, metadata = {}) {
    let definition;

    if (
      name instanceof EffectDefinition
    ) {
      definition = name;
    } else {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        throw new Error(
          "Effect name is required"
        );
      }

      const handler =
        metadata.handler instanceof EffectHandler
          ? metadata.handler
          : null;

      definition =
        new EffectDefinition({
          name,
          domain:
            metadata.domain ||
            "unknown",
          description:
            metadata.description ||
            "No description provided",
          handler,
          metadata:
            metadata.metadata || {}
        });
    }

    if (
      this.effects.has(
        definition.name
      )
    ) {
      throw new Error(
        `Effect already registered: ${definition.name}`
      );
    }

    this.effects.set(
      definition.name,
      definition
    );

    return this;
  }

  has(name) {
    return this.effects.has(name);
  }

  get(name) {
    return (
      this.effects.get(name) ||
      null
    );
  }

  execute(name, context = {}) {
    const effect =
      this.get(name);

    if (!effect) {
      throw new Error(
        `Unregistered effect: ${name}`
      );
    }

    return effect.execute(
      context
    );
  }

  list() {
    return [
      ...this.effects.values()
    ];
  }

  names() {
    return [
      ...this.effects.keys()
    ];
  }

  definitions() {
    return this.list().map(
      effect =>
        effect.toJSON()
    );
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectRegistry;
}
