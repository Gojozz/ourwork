const fs = require("fs");
const path = require("path");
const { execFileSync } =
  require("child_process");

class MP4Renderer {
  constructor(options = {}) {
    this.ffmpeg =
      options.ffmpeg ||
      "ffmpeg";
  }

  render(options = {}) {
    const inputDir =
      options.inputDir;

    const outputPath =
      options.outputPath;

    const fps =
      options.fps !== undefined
        ? options.fps
        : 30;

    if (!inputDir) {
      throw new Error(
        "Input directory is required"
      );
    }

    if (!outputPath) {
      throw new Error(
        "Output path is required"
      );
    }

    if (
      typeof fps !== "number" ||
      !Number.isFinite(fps) ||
      fps <= 0
    ) {
      throw new Error(
        "FPS must be a positive finite number"
      );
    }

    if (!fs.existsSync(inputDir)) {
      throw new Error(
        `Input directory not found: ${inputDir}`
      );
    }

    fs.mkdirSync(
      path.dirname(outputPath),
      {
        recursive: true
      }
    );

    const inputPattern =
      path.join(
        inputDir,
        "frame-%06d.png"
      );

    execFileSync(
      this.ffmpeg,
      [
        "-y",
        "-framerate",
        String(fps),
        "-i",
        inputPattern,

        "-c:v",
        "libx264",

        "-preset",
        "medium",

        "-crf",
        "18",

        "-pix_fmt",
        "yuv420p",

        "-movflags",
        "+faststart",

        outputPath
      ],
      {
        stdio: "inherit"
      }
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `MP4 was not created: ${outputPath}`
      );
    }

    const stat =
      fs.statSync(outputPath);

    if (stat.size <= 0) {
      throw new Error(
        "MP4 file is empty"
      );
    }

    return {
      outputPath,
      fps,
      size: stat.size
    };
  }

  reset() {
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    MP4Renderer;
}
