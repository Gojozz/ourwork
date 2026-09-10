const ScenarioValidator =
  require("./validator");

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
      ScenarioValidator.validate(
        scenario
      );

    if (!baseResult.valid) {
      errors.push(
        ...baseResult.errors
      );
    }

    // AI scenarios must define
    // their initial simulation state.
    if (
      !scenario ||
      typeof scenario !== "object" ||
      Array.isArray(scenario)
    ) {
      errors.push(
        "AI scenario must be an object"
      );

      return {
        valid: errors.length === 0,
        errors
      };
    }

    const initialState =
      scenario.initialState;

    if (
      !initialState ||
      typeof initialState !== "object" ||
      Array.isArray(initialState)
    ) {
      errors.push(
        "AI scenario initialState is required"
      );
    } else {
      if (
        !initialState.entities ||
        typeof initialState.entities !== "object" ||
        Array.isArray(initialState.entities)
      ) {
        errors.push(
          "AI scenario initialState.entities is required"
        );
      }

      if (
        !initialState.variables ||
        typeof initialState.variables !== "object" ||
        Array.isArray(initialState.variables)
      ) {
        errors.push(
          "AI scenario initialState.variables is required"
        );
      }
    }

    // AI events must use declarative actions.
    if (
      Array.isArray(scenario.events)
    ) {
      for (
        let i = 0;
        i < scenario.events.length;
        i++
      ) {
        const event =
          scenario.events[i];

        if (
          !event ||
          typeof event !== "object"
        ) {
          continue;
        }

        const hasAction =
          event.action &&
          typeof event.action === "object" &&
          !Array.isArray(event.action);

        const hasLegacyEffect =
          typeof event.effect === "string" &&
          event.effect.trim();

        if (
          !hasAction &&
          !hasLegacyEffect
        ) {
          errors.push(
            `Event ${i}: AI event action is required`
          );

          continue;
        }

        // Legacy effects are allowed only
        // for backward compatibility.
        if (
          hasLegacyEffect &&
          !hasAction
        ) {
          continue;
        }

        if (
          typeof event.action.domain !== "string" ||
          !event.action.domain.trim()
        ) {
          errors.push(
            `Event ${event.id || i}: action domain is required`
          );
        }

        if (
          typeof event.action.property !== "string" ||
          !event.action.property.trim()
        ) {
          errors.push(
            `Event ${event.id || i}: action property is required`
          );
        }

        if (
          typeof event.action.operation !== "string" ||
          !event.action.operation.trim()
        ) {
          errors.push(
            `Event ${event.id || i}: action operation is required`
          );
        }

        if (
          !Object.prototype.hasOwnProperty.call(
            event.action,
            "value"
          )
        ) {
          errors.push(
            `Event ${event.id || i}: action value is required`
          );
        }
      }
    }

    // Registered effect validation
    // remains available for legacy events.
    if (
      this.requireRegisteredEffects &&
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

      if (
        !catalogResult.valid
      ) {
        for (
          const event of scenario.events
        ) {
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
      valid:
        errors.length === 0,
      errors
    };
  }
}

if (typeof module !== "undefined") {
  module.exports =
    ScenarioAIValidator;
}
