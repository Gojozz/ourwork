const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

class CanvasImageBackend {
  constructor(options = {}) {
    this.width =
      options.width !== undefined
        ? options.width
        : 1080;

    this.height =
      options.height !== undefined
        ? options.height
        : 1920;

    this.chromium =
      options.chromium ||
      "chromium-browser";

    this.tempDir =
      options.tempDir ||
      fs.mkdtempSync(
        path.join(
          os.tmpdir(),
          "what-if-lab-canvas-"
        )
      );
  }

  render(options = {}) {
    const frame =
      options.frame !== undefined
        ? options.frame
        : 0;

    const outputPath =
      options.outputPath;

    if (!outputPath) {
      throw new Error(
        "Output path is required"
      );
    }

    const draw =
      typeof options.draw === "function"
        ? options.draw
        : null;

    if (!draw) {
      throw new Error(
        "Canvas draw function is required"
      );
    }

    const htmlPath =
      path.join(
        this.tempDir,
        `frame-${frame}.html`
      );

    const script =
      draw.toString();

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
html, body {
  margin: 0;
  padding: 0;
  width: ${this.width}px;
  height: ${this.height}px;
  overflow: hidden;
  background: black;
}
canvas {
  display: block;
  width: ${this.width}px;
  height: ${this.height}px;
}
</style>
</head>
<body>
<canvas
  id="canvas"
  width="${this.width}"
  height="${this.height}"
></canvas>

<script>
const canvas =
  document.getElementById("canvas");

const ctx =
  canvas.getContext("2d");

const frame = ${JSON.stringify(frame)};

const time =
  ${JSON.stringify(
    options.time !== undefined
      ? options.time
      : 0
  )};

const data =
  ${JSON.stringify(
    options.data || {}
  )};

(${script})(ctx, canvas, {
  frame,
  time,
  width: ${this.width},
  height: ${this.height},
  ...data
});
</script>
</body>
</html>`;

    fs.writeFileSync(
      htmlPath,
      html,
      "utf8"
    );

    fs.mkdirSync(
      path.dirname(outputPath),
      {
        recursive: true
      }
    );

    execFileSync(
      this.chromium,
      [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--hide-scrollbars",
        `--window-size=${this.width},${this.height}`,
        `--screenshot=${outputPath}`,
        `file://${htmlPath}`
      ],
      {
        stdio: "ignore"
      }
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `PNG was not created: ${outputPath}`
      );
    }

    return {
      frame,
      time:
        options.time !== undefined
          ? options.time
          : 0,
      width: this.width,
      height: this.height,
      outputPath
    };
  }

  reset() {
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    CanvasImageBackend;
}
