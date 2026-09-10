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

const SimulationLoop =
  require("./engine/simulation-loop");


const handler =
  new EffectHandler(
    "test.loop.effect",
    context => {
      context.state.setVariable(
        "lastTime",
        context.getTime()
      );

      context.state.setVariable(
        "lastProgress",
        context.progress
      );

      return {
        time:
          context.getTime(),
        progress:
          context.progress
      };
    }
  );


const definition =
  new EffectDefinition({
    name: "test.loop.effect",
    domain: "test",
    description: "Simulation loop test",
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
      id: "start",
      start: 0,
      end: 5,
      effect: "test.loop.effect"
    },
    {
      id: "middle",
      start: 5,
      end: 10,
      effect: "test.loop.effect"
    }
  ]);


const state =
  new SimulationState();


const renderer =
  new SimulationRenderer({
    registry,
    timeline
  });


const loop =
  new SimulationLoop({
    timeline,
    renderer,
    state
  });


const first =
  loop.update(2);


if (
  !first ||
  first.event.id !== "start"
) {
  throw new Error(
    "First loop event failed"
  );
}


if (
  first.progress !== 0.4
) {
  throw new Error(
    "First loop progress failed"
  );
}


if (
  state.getTime() !== 2
) {
  throw new Error(
    "Simulation time was not updated"
  );
}


if (
  state.getVariable("lastTime") !== 2
) {
  throw new Error(
    "Effect did not receive simulation time"
  );
}


if (
  state.getVariable("lastProgress") !== 0.4
) {
  throw new Error(
    "Effect did not receive progress"
  );
}


const second =
  loop.update(7.5);


if (
  !second ||
  second.event.id !== "middle"
) {
  throw new Error(
    "Second loop event failed"
  );
}


if (
  second.progress !== 0.5
) {
  throw new Error(
    "Second loop progress failed"
  );
}


if (
  state.getTime() !== 7.5
) {
  throw new Error(
    "Second simulation time failed"
  );
}


const none =
  loop.update(10);


if (none !== null) {
  throw new Error(
    "Loop end handling failed"
  );
}


if (
  state.getTime() !== 10
) {
  throw new Error(
    "End simulation time failed"
  );
}


loop.reset();


if (
  state.getTime() !== 0
) {
  throw new Error(
    "Loop reset failed"
  );
}


console.log(
  "TIME UPDATE: OK"
);

console.log(
  "TIMELINE → LOOP: OK"
);

console.log(
  "LOOP → RENDERER: OK"
);

console.log(
  "STATE UPDATE: OK"
);

console.log(
  "EFFECT CONTEXT: OK"
);

console.log(
  "END HANDLING: OK"
);

console.log(
  "RESET: OK"
);

console.log(
  "SIMULATION LOOP: OK"
);
