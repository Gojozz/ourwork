const SimulationLoop =
  require("./engine/simulation-loop");

const SimulationTimeline =
  require("./engine/simulation-timeline");

const SimulationRenderer =
  require("./engine/simulation-renderer");

const SimulationState =
  require("./engine/simulation-state");


const timeline =
  new SimulationTimeline([
    {
      id: "test",
      start: 0,
      end: 1,
      effect: "test.effect"
    }
  ]);


const calls = [];

const renderer = {
  updateAtTime(time, options = {}) {
    calls.push({
      time,
      state:
        options.state
    });

    return {
      time
    };
  }
};


const state =
  new SimulationState();


const loop =
  new SimulationLoop({
    timeline,
    renderer,
    state
  });


const frames =
  loop.renderFrames({
    fps: 10,
    duration: 0.3
  });


if (
  !Array.isArray(frames)
) {
  throw new Error(
    "Frame result must be an array"
  );
}


if (
  frames.length !== 3
) {
  throw new Error(
    `Expected 3 frames, got ${frames.length}`
  );
}


if (
  calls.length !== 3
) {
  throw new Error(
    "Renderer was not called for every frame"
  );
}


const expectedTimes = [
  0,
  0.1,
  0.2
];


for (
  let i = 0;
  i < expectedTimes.length;
  i++
) {
  if (
    Math.abs(
      calls[i].time -
      expectedTimes[i]
    ) > 0.000001
  ) {
    throw new Error(
      `Frame ${i} time failed`
    );
  }
}


if (
  state.getTime() !== 0.2
) {
  throw new Error(
    "Final simulation time failed"
  );
}


const frames30 =
  loop.renderFrames({
    fps: 30,
    duration: 1
  });


if (
  frames30.length !== 30
) {
  throw new Error(
    `Expected 30 frames, got ${frames30.length}`
  );
}


console.log(
  "FRAME COUNT: OK"
);

console.log(
  "DETERMINISTIC TIME: OK"
);

console.log(
  "FRAME → RENDERER: OK"
);

console.log(
  "STATE TIME: OK"
);

console.log(
  "FPS HANDLING: OK"
);

console.log(
  "DETERMINISTIC FRAME RENDERING: OK"
);
