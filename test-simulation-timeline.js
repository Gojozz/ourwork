const SimulationTimeline =
  require("./engine/simulation-timeline");

const events = [
  {
    id: "normal",
    start: 0,
    end: 5,
    effect: "effect.normal"
  },
  {
    id: "increase",
    start: 5,
    end: 10,
    effect: "effect.increase"
  },
  {
    id: "critical",
    start: 10,
    end: 20,
    effect: "effect.critical"
  }
];

const timeline =
  new SimulationTimeline(events);

if (
  timeline.getDuration() !== 20
) {
  throw new Error(
    "Duration calculation failed"
  );
}

const first =
  timeline.getActiveEvent(2);

if (
  !first ||
  first.event.id !== "normal"
) {
  throw new Error(
    "First event lookup failed"
  );
}

if (
  first.progress !== 0.4
) {
  throw new Error(
    "First event progress failed"
  );
}

const second =
  timeline.getActiveEvent(7.5);

if (
  !second ||
  second.event.id !== "increase"
) {
  throw new Error(
    "Second event lookup failed"
  );
}

if (
  second.progress !== 0.5
) {
  throw new Error(
    "Second event progress failed"
  );
}

const third =
  timeline.getActiveEvent(15);

if (
  !third ||
  third.event.id !== "critical"
) {
  throw new Error(
    "Third event lookup failed"
  );
}

if (
  third.progress !== 0.5
) {
  throw new Error(
    "Third event progress failed"
  );
}

if (
  timeline.getActiveEvent(20) !== null
) {
  throw new Error(
    "Timeline end boundary failed"
  );
}

console.log(
  "EVENT LOOKUP: OK"
);

console.log(
  "PROGRESS CALCULATION: OK"
);

console.log(
  "DURATION: OK"
);

console.log(
  "BOUNDARY HANDLING: OK"
);

console.log(
  "SIMULATION TIMELINE: OK"
);
