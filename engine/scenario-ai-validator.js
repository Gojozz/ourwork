const ScenarioValidator =
  require("./validator");

const EffectRegistry =
  require("./effect-registry");

const EffectCatalogLoader =
  require("./effect-catalog-loader");

const SimulationOperationEngine =
  require("./simulation-operation-engine");

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

    this.operationEngine =
      options.operationEngine ||
      new SimulationOperationEngine();
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

    // AI scenario duration contract:
    // Shorts scenarios must run for 30-60 seconds.
    if (
      typeof scenario.duration !== "number" ||
      !Number.isFinite(scenario.duration)
    ) {
      errors.push(
        "AI scenario duration must be a finite number"
      );
    } else if (scenario.duration < 30) {
      errors.push(
        "AI scenario duration must be at least 30 seconds"
      );
    } else if (scenario.duration > 60) {
      errors.push(
        "AI scenario duration must not exceed 60 seconds"
      );
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
      } else {
        const entityEntries =
          Object.entries(initialState.entities);

        if (entityEntries.length < 1) {
          errors.push(
            "AI scenario initialState.entities must contain at least one entity"
          );
        }

        for (const [id, entity] of entityEntries) {
          if (
            typeof id !== "string" ||
            !id.trim()
          ) {
            errors.push(
              "AI scenario entity id must be a non-empty string"
            );
            continue;
          }

          if (
            !entity ||
            typeof entity !== "object" ||
            Array.isArray(entity)
          ) {
            errors.push(
              `AI scenario entity must be an object: ${id}`
            );
            continue;
          }

          const position =
            entity.position &&
            typeof entity.position === "object" &&
            !Array.isArray(entity.position)
              ? entity.position
              : {};

          const appearance =
            entity.appearance &&
            typeof entity.appearance === "object" &&
            !Array.isArray(entity.appearance)
              ? entity.appearance
              : {};

          const hasX =
            Number.isFinite(entity.x) ||
            Number.isFinite(position.x);

          const hasY =
            Number.isFinite(entity.y) ||
            Number.isFinite(position.y);

          const hasVisualProperty =
            Number.isFinite(entity.radius) ||
            Number.isFinite(appearance.radius) ||
            Number.isFinite(entity.width) ||
            Number.isFinite(appearance.width) ||
            Number.isFinite(entity.height) ||
            Number.isFinite(appearance.height) ||
            typeof entity.shape === "string" ||
            typeof appearance.shape === "string" ||
            typeof entity.color === "string" ||
            typeof appearance.color === "string";

          if (!hasX || !hasY) {
            errors.push(
              `AI scenario entity must define numeric x/y or position.x/position.y: ${id}`
            );
          }

          if (!hasVisualProperty) {
            errors.push(
              `AI scenario entity must define at least one renderable visual property: ${id}`
            );
          }
        }
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
        } else if (event.action.domain.trim().startsWith("entity.")) {
          const entityId = event.action.domain.trim().slice("entity.".length);

          if (
            !entityId ||
            !Object.prototype.hasOwnProperty.call(
              initialState.entities,
              entityId
            )
          ) {
            errors.push(
              `Event ${event.id || i}: Entity not found: ${entityId || "<empty>"}`
            );
          }
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
        } else if (
          !this.operationEngine.has(
            event.action.operation.trim()
          )
        ) {
          errors.push(
            `Event ${event.id || i}: Unsupported simulation operation: ${event.action.operation.trim()}`
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
