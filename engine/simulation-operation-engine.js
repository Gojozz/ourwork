class SimulationOperationEngine {
  constructor(options = {}) {
    this.operations = new Map();

    this.registerDefaults();

    if (options.operations) {
      for (const [name, handler] of Object.entries(options.operations)) {
        this.register(name, handler);
      }
    }
  }

  register(name, handler) {
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error("Operation name is required");
    }

    if (typeof handler !== "function") {
      throw new Error(
        `Operation handler must be a function: ${name}`
      );
    }

    if (this.operations.has(name)) {
      throw new Error(
        `Operation already registered: ${name}`
      );
    }

    this.operations.set(name, handler);

    return this;
  }

  has(name) {
    return this.operations.has(name);
  }

  list() {
    return [...this.operations.keys()];
  }

  execute(operation, currentValue, value, context = {}) {
    if (typeof operation !== "string" || !operation.trim()) {
      throw new Error("Operation is required");
    }

    const handler = this.operations.get(operation);

    if (!handler) {
      throw new Error(
        `Unsupported simulation operation: ${operation}`
      );
    }

    return handler(
      currentValue,
      value,
      context
    );
  }

  apply(state, action, context = {}) {
    if (!state) {
      throw new Error("Simulation state is required");
    }

    if (
      !action ||
      typeof action !== "object" ||
      Array.isArray(action)
    ) {
      throw new Error("Simulation action is required");
    }

    const {
      domain,
      property,
      operation,
      value
    } = action;

    if (
      typeof domain !== "string" ||
      !domain.trim()
    ) {
      throw new Error("Action domain is required");
    }

    if (
      typeof property !== "string" ||
      !property.trim()
    ) {
      throw new Error("Action property is required");
    }

    if (
      typeof operation !== "string" ||
      !operation.trim()
    ) {
      throw new Error("Action operation is required");
    }

    const cleanDomain = domain.trim();
    const cleanProperty = property.trim();
    const cleanOperation = operation.trim();

    // Entity actions use:
    // domain: "entity.<entityId>"
    // property: "appearance.rotation"
    //
    // Example:
    // {
    //   domain: "entity.earth",
    //   property: "appearance.rotation",
    //   operation: "set",
    //   value: 0
    // }
    if (
      cleanDomain.startsWith("entity.")
    ) {
      const entityId =
        cleanDomain.slice("entity.".length).trim();

      if (!entityId) {
        throw new Error(
          "Entity action requires an entity id"
        );
      }

      const entity =
        state.getEntity(entityId);

      if (
        !entity ||
        typeof entity !== "object" ||
        Array.isArray(entity)
      ) {
        throw new Error(
          `Entity not found: ${entityId}`
        );
      }

      const parts =
        cleanProperty
          .split(".")
          .map(part => part.trim())
          .filter(Boolean);

      if (!parts.length) {
        throw new Error(
          "Entity property is required"
        );
      }

      let target = entity;

      for (
        let i = 0;
        i < parts.length - 1;
        i++
      ) {
        const part = parts[i];

        if (
          !target[part] ||
          typeof target[part] !== "object" ||
          Array.isArray(target[part])
        ) {
          target[part] = {};
        }

        target = target[part];
      }

      const leaf =
        parts[parts.length - 1];

      const currentValue =
        Object.prototype.hasOwnProperty.call(
          target,
          leaf
        )
          ? target[leaf]
          : null;

      const nextValue =
        this.execute(
          cleanOperation,
          currentValue,
          value,
          {
            ...context,
            state,
            action,
            entityId,
            entity,
            property: cleanProperty,
            entityProperty: cleanProperty
          }
        );

      if (cleanOperation === "remove") {
        delete target[leaf];
      } else {
        target[leaf] = nextValue;
      }

      state.setEntity(
        entityId,
        entity
      );

      return {
        target: "entity",
        entityId,
        domain: cleanDomain,
        property: cleanProperty,
        operation: cleanOperation,
        previousValue: currentValue,
        value:
          cleanOperation === "remove"
            ? null
            : nextValue
      };
    }

    // Existing variable behavior remains
    // backward compatible.
    const variableName =
      `${cleanDomain}.${cleanProperty}`;

    const currentValue =
      state.getVariable(variableName);

    const nextValue =
      this.execute(
        cleanOperation,
        currentValue,
        value,
        {
          ...context,
          state,
          action,
          variableName
        }
      );

    if (cleanOperation === "remove") {
      state.removeVariable(variableName);
    } else {
      state.setVariable(
        variableName,
        nextValue
      );
    }

    return {
      target: "variable",
      domain: cleanDomain,
      property: cleanProperty,
      operation: cleanOperation,
      previousValue: currentValue,
      value:
        cleanOperation === "remove"
          ? null
          : nextValue
    };
  }

  registerDefaults() {
    this.register(
      "set",
      (_current, value) => value
    );

    this.register(
      "multiply",
      (current, value) => {
        const a = Number(current);
        const b = Number(value);

        if (
          !Number.isFinite(a) ||
          !Number.isFinite(b)
        ) {
          throw new Error(
            "Multiply operation requires numeric values"
          );
        }

        return a * b;
      }
    );

    this.register(
      "add",
      (current, value) => {
        const a = Number(current);
        const b = Number(value);

        if (
          !Number.isFinite(a) ||
          !Number.isFinite(b)
        ) {
          throw new Error(
            "Add operation requires numeric values"
          );
        }

        return a + b;
      }
    );

    this.register(
      "subtract",
      (current, value) => {
        const a = Number(current);
        const b = Number(value);

        if (
          !Number.isFinite(a) ||
          !Number.isFinite(b)
        ) {
          throw new Error(
            "Subtract operation requires numeric values"
          );
        }

        return a - b;
      }
    );

    this.register(
      "remove",
      () => null
    );

    this.register(
      "enable",
      () => true
    );

    this.register(
      "disable",
      () => false
    );

    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports = SimulationOperationEngine;
}
