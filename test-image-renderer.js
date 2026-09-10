const ImageRenderer =
  require("./engine/image-renderer");

let calls = [];

const mockFrameRenderer = {
  render(options) {
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
        },
        output: {
          source: "frame-0"
        }
      },
      {
        frame: 1,
        time: 0.1,
        result: {
          state: "normal"
        },
        output: {
          source: "frame-1"
        }
      },
      {
        frame: 2,
        time: 0.2,
        result: {
          state: "changed"
        },
        output: {
          source: "frame-2"
        }
      }
    ];
  }
};

const renderer =
  new ImageRenderer({
    frameRenderer:
      mockFrameRenderer,

    renderImage(data) {
      calls.push(data);

      return {
        path:
          `image-${data.frame}.png`,
        frame:
          data.frame,
        time:
          data.time
      };
    }
  });

const images =
  renderer.render({
    fps: 10,
    duration: 0.3
  });

if (images.length !== 3) {
  throw new Error(
    "IMAGE COUNT FAILED"
  );
}

console.log(
  "IMAGE COUNT: OK"
);

if (
  images[0].frame !== 0 ||
  images[1].frame !== 1 ||
  images[2].frame !== 2
) {
  throw new Error(
    "IMAGE ORDER FAILED"
  );
}

console.log(
  "IMAGE ORDER: OK"
);

if (
  images[0].time !== 0 ||
  images[1].time !== 0.1 ||
  images[2].time !== 0.2
) {
  throw new Error(
    "IMAGE TIME FAILED"
  );
}

console.log(
  "IMAGE TIME: OK"
);

if (
  calls.length !== 3
) {
  throw new Error(
    "IMAGE CALLBACK FAILED"
  );
}

console.log(
  "IMAGE CALLBACK: OK"
);

if (
  images[2].image.path !==
  "image-2.png"
) {
  throw new Error(
    "IMAGE OUTPUT FAILED"
  );
}

console.log(
  "IMAGE OUTPUT: OK"
);

if (
  calls[0].output.source !==
  "frame-0"
) {
  throw new Error(
    "FRAME OUTPUT PASSING FAILED"
  );
}

console.log(
  "FRAME OUTPUT PASSING: OK"
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
  "image-99.png"
) {
  throw new Error(
    "SINGLE IMAGE FAILED"
  );
}

console.log(
  "SINGLE IMAGE: OK"
);

console.log(
  "IMAGE RENDERER: OK"
);
