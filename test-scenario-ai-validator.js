const ScenarioAIValidator = require("./engine/scenario-ai-validator");
const EffectRegistry = require("./engine/effect-registry");

console.log("===== SCENARIO AI VALIDATOR TEST =====");

const registry = new EffectRegistry();

registry.register("earth.normal");
registry.register("earth.decelerate");
registry.register("earth.stop");
registry.register("earth.consequences");

const validator = new ScenarioAIValidator({
  registry
});

const validScenario = {
  id: "earth-stops-rotating",
  title: "Earth Stops Rotating",
  version: 1,
  duration: 30,
  events: [
    {
      id: "normal",
      start: 0,
      end: 6,
      effect: "earth.normal"
    },
    {
      id: "decelerating",
      start: 6,
      end: 12,
      effect: "earth.decelerate"
    },
    {
      id: "stopped",
      start: 12,
      end: 20,
      effect: "earth.stop"
    },
    {
      id: "consequences",
      start: 20,
      end: 30,
      effect: "earth.consequences"
    }
  ]
};

console.log("\n===== VALID SCENARIO =====");

const validResult = validator.validate(validScenario);

console.log("VALID:", validResult.valid);
console.log("ERRORS:", validResult.errors);

const invalidScenario = {
  id: "bad-scenario",
  title: "Invalid Scenario",
  version: 1,
  duration: 30,
  events: [
    {
      id: "normal",
      start: 0,
      end: 10,
      effect: "earth.normal"
    },
    {
      id: "bad-effect",
      start: 10,
      end: 20,
      effect: "earth.destroy-universe"
    },
    {
      id: "overlap",
      start: 19,
      end: 30,
      effect: "earth.stop"
    }
  ]
};

console.log("\n===== INVALID SCENARIO =====");

const invalidResult = validator.validate(invalidScenario);

console.log("VALID:", invalidResult.valid);
console.log("ERROR COUNT:", invalidResult.errors.length);

for (const error of invalidResult.errors) {
  console.log("ERROR:", error);
}

const hasUnregisteredEffect =
  invalidResult.errors.some(
    error =>
      typeof error === "string" &&
      error.includes(
        "Unregistered effect: earth.destroy-universe"
      )
  );

const hasOverlap =
  invalidResult.errors.some(
    error =>
      typeof error === "string" &&
      error.toLowerCase().includes("overlaps previous event")
  );

if (
  validResult.valid === true &&
  validResult.errors.length === 0 &&
  invalidResult.valid === false &&
  hasUnregisteredEffect &&
  hasOverlap
) {
  console.log("\nSCENARIO AI VALIDATOR: OK");
} else {
  console.log("\nSCENARIO AI VALIDATOR: FAILED");
  process.exit(1);
}
