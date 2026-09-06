class ScenarioEngine {
  constructor(scenario = null) {
    this.scenario = null;
    this.load(scenario);
  }

  load(scenario) {
    if (!scenario || typeof scenario !== "object") {
      throw new Error("Invalid scenario");
    }

    if (typeof scenario.id !== "string") {
      throw new Error("Scenario id is required");
    }

    if (typeof scenario.title !== "string") {
      throw new Error("Scenario title is required");
    }

    if (!Array.isArray(scenario.events)) {
      throw new Error("Scenario events must be an array");
    }

    for (const event of scenario.events) {
      if (typeof event.id !== "string") {
        throw new Error("Event id is required");
      }

      if (typeof event.start !== "number") {
        throw new Error(`Invalid start time: ${event.id}`);
      }

      if (typeof event.end !== "number") {
        throw new Error(`Invalid end time: ${event.id}`);
      }

      if (event.end <= event.start) {
        throw new Error(`Invalid event range: ${event.id}`);
      }
    }

    this.scenario = scenario;
    return this.scenario;
  }

  getScenario() {
    return this.scenario;
  }

  getEvents() {
    return this.scenario?.events || [];
  }

  getDuration() {
    const events = this.getEvents();

    if (!events.length) {
      return 0;
    }

    return Math.max(...events.map(event => event.end));
  }

  reset() {
    this.scenario = null;
  }
}

if (typeof module !== "undefined") {
  module.exports = ScenarioEngine;
}
