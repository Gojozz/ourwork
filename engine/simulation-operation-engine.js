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

    const variableName =
      `${domain.trim()}.${property.trim()}`;

    const currentValue =
      state.getVariable(variableName);

    const nextValue =
      this.execute(
        operation.trim(),
        currentValue,
        value,
        {
          ...context,
          state,
          action,
          variableName
        }
      );

    state.setVariable(
      variableName,
      nextValue
    );

    return {
      domain: domain.trim(),
      property: property.trim(),
      operation: operation.trim(),
      previousValue: currentValue,
      value: nextValue
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
