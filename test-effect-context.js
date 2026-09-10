const SimulationState =
  require("./engine/simulation-state");

const EffectContext =
  require("./engine/effect-context");

const state =
  new SimulationState();

state
  .setTime(15)
  .setEntity(
    "human",
    {
      energy: 80
    }
  )
  .setVariable(
    "gravity",
    19.62
  );

const event = {
  id: "gravity-double",
  effect: "gravity.double"
};

const effect = {
  name: "gravity.double"
};

const context =
  new EffectContext({
    state,
    event,
    effect,
    deltaTime: 0.1,
    progress: 0.5
  });

if (context.getTime() !== 15) {
  throw new Error(
    "TIME ACCESS FAILED"
  );
}

if (
  context.getEntity("human").energy !==
  80
) {
  throw new Error(
    "ENTITY ACCESS FAILED"
  );
}

if (
  context.getVariable("gravity") !==
  19.62
) {
  throw new Error(
    "VARIABLE ACCESS FAILED"
  );
}

if (
  context.deltaTime !== 0.1
) {
  throw new Error(
    "DELTA TIME FAILED"
  );
}

if (
  context.progress !== 0.5
) {
  throw new Error(
    "PROGRESS FAILED"
  );
}

if (
  context.event !== event
) {
  throw new Error(
    "EVENT REFERENCE FAILED"
  );
}

if (
  context.effect !== effect
) {
  throw new Error(
    "EFFECT REFERENCE FAILED"
  );
}

const snapshot =
  context.snapshot();

if (
  snapshot.time !== 15 ||
  snapshot.deltaTime !== 0.1 ||
  snapshot.progress !== 0.5 ||
  snapshot.state.entities.human.energy !== 80 ||
  snapshot.state.variables.gravity !== 19.62
) {
  throw new Error(
    "CONTEXT SNAPSHOT FAILED"
  );
}

console.log(
  "===== EFFECT CONTEXT TEST ====="
);

console.log(
  "TIME ACCESS: OK"
);

console.log(
  "ENTITY ACCESS: OK"
);

console.log(
  "VARIABLE ACCESS: OK"
);

console.log(
  "TIMING: OK"
);

console.log(
  "EVENT: OK"
);

console.log(
  "EFFECT: OK"
);

console.log(
  "SNAPSHOT: OK"
);

console.log(
  "EFFECT CONTEXT: OK"
);
