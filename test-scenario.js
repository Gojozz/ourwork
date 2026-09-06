const ScenarioEngine =
  require("./engine/scenario.js");

const scenario = {
  id: "earth-stops",
  title: "Earth Stops Rotating",

  events: [
    {
      id: "normal",
      start: 0,
      end: 6
    },
    {
      id: "decelerating",
      start: 6,
      end: 12
    },
    {
      id: "stopped",
      start: 12,
      end: 20
    },
    {
      id: "consequences",
      start: 20,
      end: 30
    }
  ]
};

const engine =
  new ScenarioEngine(scenario);

console.log("SCENARIO:", engine.getScenario().id);
console.log("TITLE:", engine.getScenario().title);
console.log("EVENTS:", engine.getEvents().length);
console.log("DURATION:", engine.getDuration());

for (const event of engine.getEvents()) {
  console.log(
    "EVENT:",
    event.id,
    event.start,
    "->",
    event.end
  );
}
