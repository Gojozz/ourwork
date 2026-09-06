class ScenarioValidator {

  static validate(scenario) {

    const errors = [];

    if (!scenario || typeof scenario !== "object") {
      return {
        valid: false,
        errors: ["Scenario must be an object"]
      };
    }


    if (
      typeof scenario.id !== "string" ||
      !scenario.id.trim()
    ) {
      errors.push("Invalid scenario id");
    }


    if (
      typeof scenario.title !== "string" ||
      !scenario.title.trim()
    ) {
      errors.push("Invalid scenario title");
    }


    if (!Array.isArray(scenario.events)) {
      errors.push("Events must be an array");

      return {
        valid: errors.length === 0,
        errors
      };
    }


    if (scenario.events.length === 0) {
      errors.push("Scenario must contain events");
    }


    let previousEnd = 0;


    for (let i = 0; i < scenario.events.length; i++) {

      const event = scenario.events[i];

      if (!event || typeof event !== "object") {
        errors.push(
          `Event ${i} must be an object`
        );
        continue;
      }


      if (
        typeof event.id !== "string" ||
        !event.id.trim()
      ) {
        errors.push(
          `Event ${i}: invalid id`
        );
      }


      if (
        typeof event.start !== "number" ||
        !Number.isFinite(event.start)
      ) {
        errors.push(
          `Event ${i}: invalid start`
        );
      }


      if (
        typeof event.end !== "number" ||
        !Number.isFinite(event.end)
      ) {
        errors.push(
          `Event ${i}: invalid end`
        );
      }


      if (
        typeof event.start === "number" &&
        event.start < 0
      ) {
        errors.push(
          `Event ${i}: start cannot be negative`
        );
      }


      if (
        typeof event.end === "number" &&
        typeof event.start === "number" &&
        event.end <= event.start
      ) {
        errors.push(
          `Event ${i}: end must be greater than start`
        );
      }


      if (
        typeof event.effect !== "string" ||
        !event.effect.trim()
      ) {
        errors.push(
          `Event ${i}: effect is required`
        );
      }


      if (
        typeof event.start === "number" &&
        event.start < previousEnd
      ) {
        errors.push(
          `Event ${i}: overlaps previous event`
        );
      }


      if (
        typeof event.end === "number" &&
        Number.isFinite(event.end)
      ) {
        previousEnd = Math.max(
          previousEnd,
          event.end
        );
      }
    }


    if (
      typeof scenario.duration === "number" &&
      Number.isFinite(scenario.duration)
    ) {

      if (scenario.duration < previousEnd) {
        errors.push(
          "Scenario duration is shorter than final event"
        );
      }
    }


    return {
      valid: errors.length === 0,
      errors
    };
  }
}


if (typeof module !== "undefined") {
  module.exports = ScenarioValidator;
}
