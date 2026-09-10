const FrameRenderer =
  require("./engine/frame-renderer");

let calls = [];

const mockLoop = {
  renderFrames(options) {
    if (
      options.fps !== 10 ||
      options.duration !== 0.3
    ) {
      throw new Error(
        "Options were not passed correctly"
      );
    }

    return [
      {
        frame: 0,
        time: 0,
        result: {
          state: "normal"
        }
      },
      {
        frame: 1,
        time: 0.1,
        result: {
          state: "normal"
        }
      },
      {
        frame: 2,
        time: 0.2,
        result: {
          state: "changed"
        }
      }
    ];
  }
};

const renderer =
  new FrameRenderer({
    loop: mockLoop,
    renderFrame(frame) {
      calls.push(frame);

      return {
        path:
          `frame-${frame.frame}.png`,
        time:
          frame.time
      };
    }
  });

const frames =
  renderer.render({
    fps: 10,
    duration: 0.3
  });

if (frames.length !== 3) {
  throw new Error(
    "FRAME COUNT FAILED"
  );
}

console.log(
  "FRAME COUNT: OK"
);

if (
  frames[0].frame !== 0 ||
  frames[1].frame !== 1 ||
  frames[2].frame !== 2
) {
  throw new Error(
    "FRAME ORDER FAILED"
  );
}

console.log(
  "FRAME ORDER: OK"
);

if (
  frames[0].time !== 0 ||
  frames[1].time !== 0.1 ||
  frames[2].time !== 0.2
) {
  throw new Error(
    "FRAME TIME FAILED"
  );
}

console.log(
  "FRAME TIME: OK"
);

if (
  calls.length !== 3
) {
  throw new Error(
    "RENDER CALLBACK FAILED"
  );
}

console.log(
  "RENDER CALLBACK: OK"
);

if (
  frames[2].output.path !==
  "frame-2.png"
) {
  throw new Error(
    "FRAME OUTPUT FAILED"
  );
}

console.log(
  "FRAME OUTPUT: OK"
);

const single =
  renderer.renderFrame({
    frame: 99,
    time: 9.9,
    result: {
      state: "test"
    }
  });

if (
  single.path !==
  "frame-99.png"
) {
  throw new Error(
    "SINGLE FRAME FAILED"
  );
}

console.log(
  "SINGLE FRAME: OK"
);

console.log(
  "FRAME RENDERER: OK"
);
