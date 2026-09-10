const SimulationState =
  require("./engine/simulation-state");

const EffectRegistry =
  require("./engine/effect-registry");

const EffectHandler =
  require("./engine/effect-handler");

const SimulationRenderer =
  require("./engine/simulation-renderer");

const state =
  new SimulationState();

state.setTime(15);

const registry =
  new EffectRegistry();

let executed = false;
let receivedContext = null;

const testHandler =
  new EffectHandler(
    "physics.test",
    context => {
      executed = true;
      receivedContext = context;

      return {
        action: "test-effect",
        simulationTime:
          context.getTime()
      };
    }
  );

registry.register(
  "physics.test",
  {
    description:
      "Generic renderer integration test",
    handler: testHandler
  }
);

const renderer =
  new SimulationRenderer({
    registry
  });

const event = {
  id: "test-event",
  start: 10,
  end: 20,
  effect: "physics.test"
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

if (!executed) {
  throw new Error(
    "HANDLER WAS NOT EXECUTED BY RENDERER"
  );
}

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
  !receivedContext.effect ||
  receivedContext.effect.name !==
    "physics.test"
) {
  throw new Error(
    "EFFECT WAS NOT PASSED"
  );
}

if (
  receivedContext.getTime() !== 15
) {
  throw new Error(
    "SIMULATION TIME WAS NOT PASSED"
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
  !result.result ||
  result.result.action !==
    "test-effect"
) {
  throw new Error(
    "HANDLER RESULT WAS NOT RETURNED"
  );
}

if (
  result.result.simulationTime !== 15
) {
  throw new Error(
    "HANDLER RESULT IS INVALID"
  );
}

console.log(
  "===== RENDERER HANDLER INTEGRATION ====="
);

console.log(
  "EVENT → EFFECT: OK"
);

console.log(
  "EFFECT → HANDLER: OK"
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
  "HANDLER EXECUTION: OK"
);

console.log(
  "RESULT RETURN: OK"
);

console.log(
  "RENDERER HANDLER INTEGRATION: OK"
);
