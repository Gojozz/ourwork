const EffectDefinition =
  require("./effect-definition");

class EffectCatalog {
  constructor() {
    this.definitions = new Map();
  }

  register(definition) {
    if (!(definition instanceof EffectDefinition)) {
      throw new Error(
        "Effect catalog requires an EffectDefinition"
      );
    }

    if (
      this.definitions.has(
        definition.name
      )
    ) {
      throw new Error(
        `Effect already cataloged: ${definition.name}`
      );
    }

    this.definitions.set(
      definition.name,
      definition
    );

    return this;
  }

  has(name) {
    return this.definitions.has(name);
  }

  get(name) {
    return (
      this.definitions.get(name) ||
      null
    );
  }

  list() {
    return [
      ...this.definitions.values()
    ];
  }

  names() {
    return [
      ...this.definitions.keys()
    ];
  }

  domains() {
    return [
      ...new Set(
        this.list().map(
          definition =>
            definition.domain
        )
      )
    ];
  }

  byDomain(domain) {
    return this.list().filter(
      definition =>
        definition.domain === domain
    );
  }

  validateEffects(effectNames = []) {
    if (!Array.isArray(effectNames)) {
      throw new Error(
        "Effect names must be an array"
      );
    }

    const unknown = effectNames.filter(
      name =>
        typeof name !== "string" ||
        !this.has(name)
    );

    return {
      valid: unknown.length === 0,
      unknown
    };
  }

  toJSON() {
    return this.list().map(
      definition =>
        definition.toJSON()
    );
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectCatalog;
}
