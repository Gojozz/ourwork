const EffectCatalog =
  require("./effect-catalog");

const EffectDefinition =
  require("./effect-definition");

class EffectCatalogLoader {
  static fromRegistry(registry) {
    if (!registry) {
      throw new Error(
        "Effect registry is required"
      );
    }

    const catalog =
      new EffectCatalog();

    for (
      const effect of registry.list()
    ) {
      if (
        effect instanceof EffectDefinition
      ) {
        catalog.register(effect);
        continue;
      }

      if (
        typeof effect.name !== "string" ||
        !effect.name.trim()
      ) {
        throw new Error(
          "Registry effect name is required"
        );
      }

      const definition =
        new EffectDefinition({
          name: effect.name,
          domain:
            effect.domain || "unknown",
          description:
            effect.description ||
            "No description provided"
        });

      catalog.register(definition);
    }

    return catalog;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    EffectCatalogLoader;
}
