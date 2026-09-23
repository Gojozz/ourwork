const fs = require("fs");
const path = require("path");
const os = require("os");

const CanvasImageBackend =
  require("./engine/canvas-image-backend");

const canvasVisualDraw =
  require("./engine/canvas-visual-draw");

const outputDir =
  fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "what-if-lab-pixel-test-"
    )
  );

const outputPath =
  path.join(
    outputDir,
    "entity.png"
  );

const chrome =
  process.env.WHAT_IF_LAB_CHROME ||
  (
    fs.existsSync("/data/data/com.termux/files/usr/bin/chromium-browser")
      ? "/data/data/com.termux/files/usr/bin/chromium-browser"
      : fs.existsSync("/data/data/com.termux/files/usr/bin/chromium")
        ? "/data/data/com.termux/files/usr/bin/chromium"
        : fs.existsSync("/usr/bin/google-chrome")
          ? "/usr/bin/google-chrome"
          : fs.existsSync("/usr/bin/chromium")
            ? "/usr/bin/chromium"
            : fs.existsSync("/usr/bin/chromium-browser")
              ? "/usr/bin/chromium-browser"
              : "google-chrome"
  );

const backend =
  new CanvasImageBackend({
    width: 1080,
    height: 1920,
    chromium: chrome
  });

const data = {
  entities: {
    earth: {
      position: {
        x: 540,
        y: 960
      },
      appearance: {
        shape: "circle",
        radius: 300,
        color: "#4da6ff"
      }
    }
  },
  variables: {}
};

console.log(
  "CHROME:",
  chrome
);

console.log(
  "OUTPUT:",
  outputPath
);

const debugDraw = function(ctx, canvas, options = {}) {
  const width = options.width || canvas.width;
  const height = options.height || canvas.height;

  ctx.fillStyle = "#050914";
  ctx.fillRect(0, 0, width, height);

  const entities = options.entities || {};

  console.log(
    "BROWSER ENTITY COUNT:",
    Object.keys(entities).length
  );

  for (const [id, entity] of Object.entries(entities)) {
    console.log(
      "BROWSER ENTITY:",
      id,
      JSON.stringify(entity)
    );

    const position = entity.position || {};
    const appearance = entity.appearance || {};

    const x = Number.isFinite(position.x)
      ? position.x
      : width / 2;

    const y = Number.isFinite(position.y)
      ? position.y
      : height / 2;

    const radius = Number.isFinite(appearance.radius)
      ? appearance.radius
      : 80;

    const color =
      appearance.color ||
      "#4da6ff";

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      x,
      y,
      radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }

  return {
    rendered: Object.keys(entities).length > 0,
    count: Object.keys(entities).length
  };
};

const result =
  backend.render({
    frame: 0,
    time: 0,
    outputPath,
    draw: debugDraw,
    data
  });

console.log(
  "PNG:",
  result.outputPath
);

console.log(
  "SIZE:",
  result.size
);

if (!fs.existsSync(outputPath)) {
  throw new Error(
    "PIXEL REGRESSION: PNG missing"
  );
}

console.log(
  "PIXEL REGRESSION: PNG CREATED"
);

console.log(
  "TEST PNG:",
  outputPath
);
