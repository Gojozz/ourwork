const EffectRegistry =
  require("./engine/effect-registry");

const SimulationRenderer =
  require("./engine/simulation-renderer");

const SimulationState =
  require("./engine/simulation-state");

const SimulationTimeline =
  require("./engine/simulation-timeline");

const registry =
  new EffectRegistry();

registry.register(
  "earth.normal",
  {
    description: "Normal Earth rotation"
  }
);

registry.register(
  "earth.stop",
  {
    description: "Stop Earth's rotation"
  }
);

const renderer =
  new SimulationRenderer({
    registry
  });

const normalEvent = {
  id: "normal",
  start: 0,
  end: 6,
  effect: "earth.normal"
};

const stoppedEvent = {
  id: "stopped",
  start: 12,
  end: 20,
  effect: "earth.stop"
};

const first =
  renderer.update(normalEvent);

if (
  !first.effect ||
  first.effect.name !== "earth.normal" ||
  first.event.id !== "normal" ||
  first.changed !== true
) {
  throw new Error(
    "NORMAL EVENT FAILED"
  );
}

const second =
  renderer.update(normalEvent);

if (second.changed !== false) {
  throw new Error(
    "UNCHANGED EVENT FAILED"
  );
}

const third =
  renderer.update(stoppedEvent);

if (
  !third.effect ||
  third.effect.name !== "earth.stop" ||
  third.event.id !== "stopped" ||
  third.changed !== true
) {
  throw new Error(
    "STOP EVENT FAILED"
  );
}

let rejected = false;

try {
  renderer.update({
    id: "bad",
    start: 20,
    end: 25,
    effect: "unknown.effect"
  });
} catch (error) {
  rejected = true;
}

if (!rejected) {
  throw new Error(
    "UNREGISTERED EFFECT WAS NOT REJECTED"
  );
}

// ------------------------------------------------------------
// ENTITY ACTION -> STATE REGRESSION
// ------------------------------------------------------------

const actionRenderer =
  new SimulationRenderer({
    registry
  });

const actionTimeline =
  new SimulationTimeline();

actionTimeline.setEvents([
  {
    id: "entity-action",
    start: 0,
    end: 10,
    action: {
      domain: "entity.earth",
      property: "appearance.rotation",
      operation: "set",
      value: 1.5
    }
  }
]);

actionRenderer.timeline =
  actionTimeline;

const actionState =
  new SimulationState({
    entities: {
      earth: {
        position: {
          x: 540,
          y: 960
        },
        appearance: {
          shape: "circle",
          radius: 250,
          color: "#4da6ff",
          rotation: 0
        }
      }
    },
    variables: {}
  });

const actionResult =
  actionRenderer.updateAtTime(
    5,
    {
      state: actionState
    }
  );

if (
  !actionResult ||
  actionResult.changed !== true ||
  actionState.getEntity("earth").appearance.rotation !== 1.5
) {
  throw new Error(
    "ENTITY ACTION PIPELINE FAILED"
  );
}

const secondActionResult =
  actionRenderer.updateAtTime(
    6,
    {
      state: actionState
    }
  );

if (secondActionResult.changed !== false) {
  throw new Error(
    "ENTITY ACTION REAPPLIED"
  );
}

console.log(
  "ENTITY ACTION -> STATE: OK"
);

renderer.reset();

if (
  renderer.currentEffect !== null ||
  renderer.currentEvent !== null
) {
  throw new Error(
    "RESET FAILED"
  );
}

console.log(
  "===== SIMULATION RENDERER TEST ====="
);

console.log(
  "NORMAL EFFECT: earth.normal"
);

console.log(
  "STOP EFFECT: earth.stop"
);

console.log(
  "UNREGISTERED EFFECT: REJECTED"
);

console.log(
  "RESET: OK"
);

console.log(
  "SIMULATION RENDERER: OK"
);
