const ScenarioLoader =
  require("./engine/loader.js");


const loader =
  new ScenarioLoader("./scenarios");


console.log("===== SCENARIO LOADER TEST =====");


console.log(
  "AVAILABLE:",
  loader.getScenarioIds()
);


const scenario =
  loader.load("earth-stops");


console.log(
  "LOADED:",
  scenario.getScenario().id
);


console.log(
  "TITLE:",
  scenario.getScenario().title
);


console.log(
  "DURATION:",
  scenario.getDuration()
);


console.log(
  "EVENTS:",
  scenario.getEvents().length
);


console.log("");
console.log("LOADER: OK");
