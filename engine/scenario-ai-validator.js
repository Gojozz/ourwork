const ScenarioValidator = require("./validator");
const EffectRegistry =
  require("./effect-registry");

const EffectCatalogLoader =
  require("./effect-catalog-loader");

class ScenarioAIValidator {
  constructor(options = {}) {
    this.registry =
      options.registry ||
      new EffectRegistry();

    this.requireRegisteredEffects =
      options.requireRegisteredEffects !== false;

    this.catalog =
      options.catalog ||
      EffectCatalogLoader.fromRegistry(
        this.registry
      );
  }

  validate(scenario) {
    const errors = [];

    // Basic scenario validation
    const baseResult =
      ScenarioValidator.validate(scenario);

    if (!baseResult.valid) {
      errors.push(...baseResult.errors);
    }

    // Registered effect validation
    if (
      this.requireRegisteredEffects &&
      scenario &&
      Array.isArray(scenario.events)
    ) {
      const effectNames =
        scenario.events
          .filter(
            event =>
              event &&
              typeof event.effect === "string" &&
              event.effect.trim()
          )
          .map(
            event =>
              event.effect.trim()
          );

      const catalogResult =
        this.catalog.validateEffects(
          effectNames
        );

      if (!catalogResult.valid) {
        for (const event of scenario.events) {
          if (
            event &&
            typeof event.effect === "string" &&
            event.effect.trim() &&
            catalogResult.unknown.includes(
              event.effect.trim()
            )
          ) {
            errors.push(
              `Event ${event.id || "unknown"}: Unregistered effect: ${event.effect}`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = ScenarioAIValidator;
}
