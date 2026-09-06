const TimelineEngine =
  require("./engine/timeline.js");

const EffectEngine =
  require("./engine/effects.js");

const timeline =
  new TimelineEngine([
    {
      id: "normal",
      start: 0,
      end: 6
    },
    {
      id: "critical",
      start: 6,
      end: 12
    },
    {
      id: "stopped",
      start: 12,
      end: 20
    }
  ]);

console.log("TIME 0:", timeline.getEvent(0)?.id);
console.log("TIME 7:", timeline.getEvent(7)?.id);
console.log("TIME 15:", timeline.getEvent(15)?.id);

const effects =
  new EffectEngine();

effects.register(
  "earth.stop",
  () => "EARTH ROTATION STOPPED"
);

effects.register(
  "camera.shake",
  () => "CAMERA SHAKE"
);

console.log("EFFECTS:", effects.list());
console.log("RUN:", effects.run("earth.stop"));
