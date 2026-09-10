class SimulationState {
  constructor(options = {}) {
    this.time =
      options.time !== undefined
        ? options.time
        : 0;

    this.entities = {
      ...(options.entities || {})
    };

    this.variables = {
      ...(options.variables || {})
    };

    this.events = Array.isArray(options.events)
      ? [...options.events]
      : [];
  }

  setTime(time) {
    if (
      typeof time !== "number" ||
      !Number.isFinite(time)
    ) {
      throw new Error(
        "Simulation time must be a finite number"
      );
    }

    if (time < 0) {
      throw new Error(
        "Simulation time cannot be negative"
      );
    }

    this.time = time;

    return this;
  }

  getTime() {
    return this.time;
  }

  setEntity(id, value) {
    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      throw new Error(
        "Entity id is required"
      );
    }

    this.entities[id] = value;

    return this;
  }

  getEntity(id) {
    return Object.prototype.hasOwnProperty.call(
      this.entities,
      id
    )
      ? this.entities[id]
      : null;
  }

  removeEntity(id) {
    delete this.entities[id];

    return this;
  }

  setVariable(name, value) {
    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      throw new Error(
        "Variable name is required"
      );
    }

    this.variables[name] = value;

    return this;
  }

  getVariable(name) {
    return Object.prototype.hasOwnProperty.call(
      this.variables,
      name
    )
      ? this.variables[name]
      : null;
  }

  removeVariable(name) {
    delete this.variables[name];

    return this;
  }

  addEvent(event) {
    if (
      !event ||
      typeof event !== "object"
    ) {
      throw new Error(
        "Simulation event must be an object"
      );
    }

    this.events.push(event);

    return this;
  }

  getEvents() {
    return [...this.events];
  }

  snapshot() {
    return {
      time: this.time,

      entities: {
        ...this.entities
      },

      variables: {
        ...this.variables
      },

      events: [...this.events]
    };
  }

  reset() {
    this.time = 0;
    this.entities = {};
    this.variables = {};
    this.events = [];

    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports = SimulationState;
}
