const SimulationState =
  require("./engine/simulation-state");

const EffectHandler =
  require("./engine/effect-handler");

const EffectRegistry =
  require("./engine/effect-registry");

const SimulationRenderer =
  require("./engine/simulation-renderer");

const state =
  new SimulationState();

state
  .setTime(10)
  .setEntity(
    "human",
    {
      energy: 50
    }
  )
  .setVariable(
    "gravity",
    19.62
  );

let receivedContext = null;

const handler =
  new EffectHandler(
    "gravity.double",
    context => {
      receivedContext = context;

      return {
        stateTime:
          context.getTime(),

        gravity:
          context.getVariable(
            "gravity"
          )
      };
    }
  );

const registry =
  new EffectRegistry();

registry.register(
  "gravity.double",
  {
    handler
  }
);

const renderer =
  new SimulationRenderer({
    registry
  });

const event = {
  id: "gravity-event",
  start: 5,
  end: 15,
  effect: "gravity.double"
};

const result =
  renderer.update(
    event,
    {
      state,
      deltaTime: 0.1,
      progress: 0.5
    }
  );

if (!receivedContext) {
  throw new Error(
    "CONTEXT WAS NOT CREATED"
  );
}

if (
  receivedContext.state !== state
) {
  throw new Error(
    "STATE WAS NOT PASSED"
  );
}

if (
  receivedContext.event !== event
) {
  throw new Error(
    "EVENT WAS NOT PASSED"
  );
}

if (
  receivedContext.effect.name !==
  "gravity.double"
) {
  throw new Error(
    "EFFECT WAS NOT PASSED"
  );
}

if (
  receivedContext.deltaTime !== 0.1
) {
  throw new Error(
    "DELTA TIME WAS NOT PASSED"
  );
}

if (
  receivedContext.progress !== 0.5
) {
  throw new Error(
    "PROGRESS WAS NOT PASSED"
  );
}

if (
  receivedContext.getTime() !== 10
) {
  throw new Error(
    "STATE ACCESS FAILED"
  );
}

if (
  receivedContext.getEntity(
    "human"
  ).energy !== 50
) {
  throw new Error(
    "ENTITY ACCESS FAILED"
  );
}

if (
  receivedContext.getVariable(
    "gravity"
  ) !== 19.62
) {
  throw new Error(
    "VARIABLE ACCESS FAILED"
  );
}

if (
  !result.result ||
  result.result.stateTime !== 10 ||
  result.result.gravity !== 19.62
) {
  throw new Error(
    "HANDLER RESULT INVALID"
  );
}

console.log(
  "===== RENDERER CONTEXT TEST ====="
);

console.log(
  "CONTEXT CREATION: OK"
);

console.log(
  "STATE PASSING: OK"
);

console.log(
  "EVENT PASSING: OK"
);

console.log(
  "EFFECT PASSING: OK"
);

console.log(
  "TIMING PASSING: OK"
);

console.log(
  "UNIVERSAL STATE ACCESS: OK"
);

console.log(
  "HANDLER EXECUTION: OK"
);

console.log(
  "RENDERER CONTEXT: OK"
);
