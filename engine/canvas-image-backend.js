const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");

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

    const absoluteHtmlPath =
      path.resolve(htmlPath);

    const absoluteOutputPath =
      path.resolve(outputPath);

    const script =
      draw.toString();

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>WHAT IF LAB FRAME ${frame}</title>
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

const frame =
  ${JSON.stringify(frame)};

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

try {
  (${script})(ctx, canvas, {
    frame,
    time,
    width: ${this.width},
    height: ${this.height},
    ...data
  });

  document.body.setAttribute(
    "data-what-if-lab-render",
    "ok"
  );
} catch (error) {
  document.body.setAttribute(
    "data-what-if-lab-render",
    "failed"
  );

  document.body.setAttribute(
    "data-what-if-lab-error",
    String(error && error.message || error)
  );

  throw error;
}
</script>
</body>
</html>`;

    fs.mkdirSync(
      path.dirname(absoluteOutputPath),
      {
        recursive: true
      }
    );

    fs.writeFileSync(
      absoluteHtmlPath,
      html,
      "utf8"
    );

    if (!fs.existsSync(absoluteHtmlPath)) {
      throw new Error(
        `HTML was not created: ${absoluteHtmlPath}`
      );
    }

    const htmlUrl =
      pathToFileURL(
        absoluteHtmlPath
      ).href;

    let domOutput;

    try {
      domOutput =
        execFileSync(
          this.chromium,
          [
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-extensions",
            "--disable-background-networking",
            "--no-first-run",
            "--no-default-browser-check",
            "--allow-file-access-from-files",
            "--hide-scrollbars",
            `--window-size=${this.width},${this.height}`,
            "--run-all-compositor-stages-before-draw",
            "--virtual-time-budget=1000",
            `--screenshot=${absoluteOutputPath}`,
            "--dump-dom",
            htmlUrl
          ],
          {
            encoding: "utf8",
            stdio: [
              "ignore",
              "pipe",
              "pipe"
            ]
          }
        );
    } catch (error) {
      const stderr =
        error &&
        error.stderr
          ? String(error.stderr)
          : "";

      const stdout =
        error &&
        error.stdout
          ? String(error.stdout)
          : "";

      throw new Error(
        [
          `Chromium render failed for frame ${frame}`,
          `HTML: ${absoluteHtmlPath}`,
          `URL: ${htmlUrl}`,
          stderr.trim(),
          stdout.trim()
        ]
          .filter(Boolean)
          .join("\n")
      );
    }

    const dom =
      String(domOutput || "");

    if (
      !dom.includes(
        'data-what-if-lab-render="ok"'
      )
    ) {
      const errorMatch =
        dom.match(
          /data-what-if-lab-error="([^"]*)"/
        );

      throw new Error(
        [
          `Chromium page did not render successfully for frame ${frame}`,
          errorMatch
            ? `Render error: ${errorMatch[1]}`
            : "Render marker was not found",
          `HTML: ${absoluteHtmlPath}`,
          `URL: ${htmlUrl}`
        ].join("\n")
      );
    }

    if (!fs.existsSync(absoluteOutputPath)) {
      throw new Error(
        `PNG was not created: ${absoluteOutputPath}`
      );
    }

    const stat =
      fs.statSync(
        absoluteOutputPath
      );

    if (stat.size <= 100) {
      throw new Error(
        `PNG is suspiciously small: ${absoluteOutputPath} (${stat.size} bytes)`
      );
    }

    const header =
      fs.readFileSync(
        absoluteOutputPath
      ).subarray(0, 8);

    const pngSignature =
      Buffer.from([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a
      ]);

    if (!header.equals(pngSignature)) {
      throw new Error(
        `Output is not a valid PNG: ${absoluteOutputPath}`
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
      outputPath: absoluteOutputPath,
      size: stat.size
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
