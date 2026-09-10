const SimulationState =
  require("./engine/simulation-state");

const state =
  new SimulationState();

if (state.getTime() !== 0) {
  throw new Error(
    "INVALID DEFAULT TIME"
  );
}

state.setTime(12.5);

if (state.getTime() !== 12.5) {
  throw new Error(
    "TIME SET FAILED"
  );
}

state.setEntity(
  "earth",
  {
    rotation: 0.5
  }
);

state.setEntity(
  "human",
  {
    hunger: 0
  }
);

if (
  state.getEntity("earth").rotation !==
  0.5
) {
  throw new Error(
    "ENTITY STORAGE FAILED"
  );
}

if (
  state.getEntity("human").hunger !==
  0
) {
  throw new Error(
    "MULTIPLE ENTITY STORAGE FAILED"
  );
}

state.setVariable(
  "gravity",
  9.81
);

state.setVariable(
  "atmosphere",
  1
);

if (
  state.getVariable("gravity") !==
  9.81
) {
  throw new Error(
    "VARIABLE STORAGE FAILED"
  );
}

state.addEvent({
  id: "gravity-change",
  time: 10
});

if (
  state.getEvents().length !== 1
) {
  throw new Error(
    "EVENT STORAGE FAILED"
  );
}

const snapshot =
  state.snapshot();

if (
  snapshot.time !== 12.5 ||
  !snapshot.entities.earth ||
  !snapshot.entities.human ||
  snapshot.variables.gravity !== 9.81 ||
  snapshot.events.length !== 1
) {
  throw new Error(
    "SNAPSHOT FAILED"
  );
}

let negativeRejected = false;

try {
  state.setTime(-1);
} catch (error) {
  negativeRejected = true;
}

if (!negativeRejected) {
  throw new Error(
    "NEGATIVE TIME WAS NOT REJECTED"
  );
}

state.reset();

if (
  state.getTime() !== 0 ||
  Object.keys(state.entities).length !== 0 ||
  Object.keys(state.variables).length !== 0 ||
  state.events.length !== 0
) {
  throw new Error(
    "RESET FAILED"
  );
}

console.log(
  "===== SIMULATION STATE TEST ====="
);

console.log(
  "TIME: OK"
);

console.log(
  "ENTITIES: OK"
);

console.log(
  "VARIABLES: OK"
);

console.log(
  "EVENTS: OK"
);

console.log(
  "SNAPSHOT: OK"
);

console.log(
  "VALIDATION: OK"
);

console.log(
  "RESET: OK"
);

console.log(
  "SIMULATION STATE: OK"
);
