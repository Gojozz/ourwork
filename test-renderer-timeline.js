const EffectHandler =
  require("./engine/effect-handler");

const EffectDefinition =
  require("./engine/effect-definition");

const EffectRegistry =
  require("./engine/effect-registry");

const SimulationTimeline =
  require("./engine/simulation-timeline");

const SimulationRenderer =
  require("./engine/simulation-renderer");

const SimulationState =
  require("./engine/simulation-state");


const handler =
  new EffectHandler(
    "test.timeline.effect",
    context => {
      context.state.setVariable(
        "lastProgress",
        context.progress
      );

      return {
        progress: context.progress
      };
    }
  );


const definition =
  new EffectDefinition({
    name: "test.timeline.effect",
    domain: "test",
    description: "Timeline integration test",
    handler
  });


const registry =
  new EffectRegistry();

registry.register(
  definition
);


const timeline =
  new SimulationTimeline([
    {
      id: "first",
      start: 0,
      end: 5,
      effect: "test.timeline.effect"
    },
    {
      id: "second",
      start: 5,
      end: 10,
      effect: "test.timeline.effect"
    }
  ]);


const state =
  new SimulationState();

state.setVariable(
  "lastProgress",
  0
);


const renderer =
  new SimulationRenderer({
    registry,
    timeline
  });


const first =
  renderer.updateAtTime(
    2,
    {
      state
    }
  );


if (
  !first ||
  first.event.id !== "first"
) {
  throw new Error(
    "First timeline event failed"
  );
}


if (
  first.progress !== 0.4
) {
  throw new Error(
    "First timeline progress failed"
  );
}


if (
  state.getVariable(
    "lastProgress"
  ) !== 0.4
) {
  throw new Error(
    "First effect execution failed"
  );
}


const second =
  renderer.updateAtTime(
    7.5,
    {
      state
    }
  );


if (
  !second ||
  second.event.id !== "second"
) {
  throw new Error(
    "Second timeline event failed"
  );
}


if (
  second.progress !== 0.5
) {
  throw new Error(
    "Second timeline progress failed"
  );
}


if (
  state.getVariable(
    "lastProgress"
  ) !== 0.5
) {
  throw new Error(
    "Second effect execution failed"
  );
}


const none =
  renderer.updateAtTime(
    10,
    {
      state
    }
  );


if (none !== null) {
  throw new Error(
    "Timeline end handling failed"
  );
}


console.log(
  "TIMELINE → RENDERER: OK"
);

console.log(
  "ACTIVE EVENT: OK"
);

console.log(
  "PROGRESS: OK"
);

console.log(
  "EFFECT EXECUTION: OK"
);

console.log(
  "TIMELINE END: OK"
);

console.log(
  "RENDERER TIMELINE INTEGRATION: OK"
);
