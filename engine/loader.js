const fs = require("fs");
const path = require("path");

const ScenarioEngine =
  require("./scenario.js");


class ScenarioLoader {

  constructor(directory = "./scenarios") {
    this.directory = directory;
  }


  getScenarioIds() {

    if (!fs.existsSync(this.directory)) {
      return [];
    }

    return fs.readdirSync(this.directory)
      .filter(file => file.endsWith(".json"))
      .map(file => file.replace(/\.json$/, ""));
  }


  load(id) {

    if (typeof id !== "string" || !id.trim()) {
      throw new Error("Scenario id is required");
    }

    const file =
      path.join(this.directory, `${id}.json`);

    if (!fs.existsSync(file)) {
      throw new Error(
        `Scenario not found: ${id}`
      );
    }

    const raw =
      fs.readFileSync(file, "utf8");

    let data;

    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new Error(
        `Invalid JSON: ${id}`
      );
    }

    return new ScenarioEngine(data);
  }
}


if (typeof module !== "undefined") {
  module.exports = ScenarioLoader;
}
