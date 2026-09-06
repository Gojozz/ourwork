const ScenarioEngine =
  require("./engine/scenario.js");

const TimelineEngine =
  require("./engine/timeline.js");

const EffectEngine =
  require("./engine/effects.js");


const scenario = {
  id: "earth-stops",
  title: "Earth Stops Rotating",

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


const scenarioEngine =
  new ScenarioEngine(scenario);

const timeline =
  new TimelineEngine(
    scenarioEngine.getEvents()
  );

const effects =
  new EffectEngine();


effects.register(
  "earth.normal",
  () => "NORMAL ROTATION"
);

effects.register(
  "earth.decelerate",
  () => "ROTATION DECELERATING"
);

effects.register(
  "earth.stop",
  () => "EARTH STOPPED"
);

effects.register(
  "earth.consequences",
  () => "CONSEQUENCES ACTIVE"
);


console.log("===== PIPELINE TEST =====");

console.log(
  "SCENARIO:",
  scenarioEngine.getScenario().id
);

for (const time of [0, 7, 15, 25]) {

  const result =
    timeline.update(time);

  const event =
    result.event;

  console.log("");
  console.log("TIME:", time);
  console.log("EVENT:", event?.id);

  if (event?.effect) {
    console.log(
      "EFFECT:",
      effects.run(event.effect)
    );
  }
}

console.log("");
console.log(
  "REGISTERED EFFECTS:",
  effects.list()
);

console.log("");
console.log("PIPELINE: OK");
