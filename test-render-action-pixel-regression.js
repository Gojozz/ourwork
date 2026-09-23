const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const SimulationRenderPipeline = require("./engine/simulation-render-pipeline");
const CanvasImageBackend = require("./engine/canvas-image-backend");

const outputDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "what-if-action-pixel-")
);

const scenario = {
  initialState: {
    entities: {
      earth: {
        position: { x: 540, y: 960 },
        appearance: {
          shape: "circle",
          radius: 300,
          color: "#4da6ff"
        }
      }
    },
    variables: {}
  },
  events: [
    {
      id: "shrink-earth",
      start: 1,
      end: 2,
      action: {
        domain: "entity.earth",
        property: "appearance.radius",
        operation: "set",
        value: 150
      }
    }
  ]
};

function inspectPng(file) {
  const script = `
from PIL import Image
import sys
import hashlib

img = Image.open(sys.argv[1]).convert("RGBA")
pixels = img.load()

target = (77, 166, 255, 255)
count = sum(
    1
    for y in range(img.height)
    for x in range(img.width)
    if pixels[x, y] == target
)

print(f"{img.width}x{img.height}|{count}|{hashlib.md5(img.tobytes()).hexdigest()}")
`;

  const output = execFileSync(
    "python3",
    ["-c", script, file],
    { encoding: "utf8" }
  ).trim();

  const [size, pixels, checksum] = output.split("|");

  return {
    size,
    pixels: Number(pixels),
    checksum
  };
}

(async () => {
  console.log("=== PIPELINE ACTION PIXEL REGRESSION ===");

  const backend = new CanvasImageBackend({
    width: 1080,
    height: 1920,
    browser: "google-chrome"
  });

  const pipeline = new SimulationRenderPipeline({ backend });

  const result = pipeline
    .configure(scenario)
    .render({
      fps: 1,
      duration: 3,
      outputDir,
      outputPath: path.join(outputDir, "test.mp4")
    });

  const frame0 = inspectPng(result.frames[0].outputPath);
  const frame1 = inspectPng(result.frames[1].outputPath);
  const frame2 = inspectPng(result.frames[2].outputPath);

  console.log("FRAME 0:", frame0);
  console.log("FRAME 1:", frame1);
  console.log("FRAME 2:", frame2);

  if (!(frame0.pixels > frame1.pixels)) {
    throw new Error(
      `Expected Earth to shrink: frame0=${frame0.pixels}, frame1=${frame1.pixels}`
    );
  }

  if (frame1.pixels !== frame2.pixels) {
    throw new Error(
      `Expected action state to persist: frame1=${frame1.pixels}, frame2=${frame2.pixels}`
    );
  }

  if (frame0.checksum === frame1.checksum) {
    throw new Error("Frame 0 and frame 1 are identical");
  }

  console.log("EVENT -> OPERATION -> STATE -> PIXEL CHANGE: PASS");
})();
