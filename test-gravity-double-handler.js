const SimulationState =
  require("./engine/simulation-state");

const GravityDoubleHandler =
  require("./engine/handlers/physics/gravity-double");

const EffectContext =
  require("./engine/effect-context");

const state =
  new SimulationState();

state.setVariable(
  "gravity",
  9.81
);

const handler =
  new GravityDoubleHandler();

const context =
  new EffectContext({
    state
  });

const result =
  handler.execute(context);

if (
  state.getVariable("gravity") !==
  19.62
) {
  throw new Error(
    "GRAVITY WAS NOT DOUBLED"
  );
}

if (
  state.getVariable(
    "gravityMultiplier"
  ) !== 2
) {
  throw new Error(
    "GRAVITY MULTIPLIER INVALID"
  );
}

if (
  result.previousGravity !== 9.81
) {
  throw new Error(
    "PREVIOUS GRAVITY INVALID"
  );
}

if (
  result.gravity !== 19.62
) {
  throw new Error(
    "NEW GRAVITY INVALID"
  );
}

if (
  result.multiplier !== 2
) {
  throw new Error(
    "MULTIPLIER INVALID"
  );
}

if (
  result.state !==
  "gravity-doubled"
) {
  throw new Error(
    "STATE INVALID"
  );
}

console.log(
  "===== GRAVITY DOUBLE HANDLER TEST ====="
);

console.log(
  "PHYSICS HANDLER: OK"
);

console.log(
  "GRAVITY READ: OK"
);

console.log(
  "GRAVITY UPDATE: OK"
);

console.log(
  "MULTIPLIER: OK"
);

console.log(
  "RESULT: OK"
);

console.log(
  "GRAVITY DOUBLE HANDLER: OK"
);
