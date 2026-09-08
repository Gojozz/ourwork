const ScenarioValidator = require("./validator");
const EffectRegistry = require("./effect-registry");

class ScenarioAIValidator {
  constructor(options = {}) {
    this.registry =
      options.registry ||
      new EffectRegistry();

    this.requireRegisteredEffects =
      options.requireRegisteredEffects !== false;
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
      for (const event of scenario.events) {
        if (
          event &&
          typeof event.effect === "string" &&
          event.effect.trim() &&
          !this.registry.has(event.effect)
        ) {
          errors.push(
            `Event ${event.id || "unknown"}: Unregistered effect: ${event.effect}`
          );
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
