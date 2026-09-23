const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const SimulationRenderPipeline = require("./engine/simulation-render-pipeline");
const CanvasImageBackend = require("./engine/canvas-image-backend");

const outputDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "what-if-lab-pipeline-test-")
);
const outputPath = path.join(outputDir, "final.mp4");

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
  events: []
};

const backend = new CanvasImageBackend({
  browser:
    fs.existsSync("/data/data/com.termux/files/usr/bin/chromium-browser")
      ? "/data/data/com.termux/files/usr/bin/chromium-browser"
      : "google-chrome"
});

const pipeline = new SimulationRenderPipeline({ backend });
pipeline.configure(scenario);

console.log("=== PIPELINE ENTITY TEST ===");
console.log("STATE ENTITIES:", Object.keys(pipeline.state.entities));

const result = pipeline.render({
  fps: 1,
  duration: 1,
  outputDir,
  outputPath
});

console.log("FRAMES:", result.frames);
console.log("OUTPUT DIR:", outputDir);
console.log("MP4:", result.mp4);

const pngs = fs.readdirSync(outputDir)
  .filter(x => x.endsWith(".png"))
  .map(x => path.join(outputDir, x));

console.log("PNG FILES:", pngs);

if (pngs.length === 0) {
  throw new Error("No PNG frame produced");
}

const png = pngs[0];

const py = `
from PIL import Image
from collections import Counter
img = Image.open(${JSON.stringify(png)}).convert("RGB")
counts = Counter(img.getdata())
bg = (5, 9, 20)
total = img.width * img.height
bg_count = counts.get(bg, 0)

print("SIZE:", img.size)
print("UNIQUE COLORS:", len(counts))
print("NON-BACKGROUND:", total - bg_count)
print("ENTITY COLOR PIXELS:", counts.get((77,166,255), 0))
print("TOP COLORS:", counts.most_common(8))

if counts.get((77,166,255), 0) > 1000:
    print("PIPELINE ENTITY RENDER: PASS")
else:
    print("PIPELINE ENTITY RENDER: FAIL")
    raise SystemExit(1)
`;

execFileSync("python3", ["-c", py], { stdio: "inherit" });
