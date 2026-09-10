const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

class AudioMuxRenderer {
  constructor(options = {}) {
    this.ffmpeg =
      options.ffmpeg || "ffmpeg";
  }

  render(options = {}) {
    const videoPath = options.videoPath;
    const audioPath = options.audioPath;
    const outputPath = options.outputPath;

    if (!videoPath) {
      throw new Error("Video path is required");
    }

    if (!audioPath) {
      throw new Error("Audio path is required");
    }

    if (!outputPath) {
      throw new Error("Output path is required");
    }

    if (!fs.existsSync(videoPath)) {
      throw new Error(
        `Video not found: ${videoPath}`
      );
    }

    if (!fs.existsSync(audioPath)) {
      throw new Error(
        `Audio not found: ${audioPath}`
      );
    }

    fs.mkdirSync(
      path.dirname(outputPath),
      { recursive: true }
    );

    execFileSync(
      this.ffmpeg,
      [
        "-y",
        "-i", videoPath,
        "-i", audioPath,

        "-map", "0:v:0",
        "-map", "1:a:0",

        "-c:v", "copy",
        "-c:a", "aac",
        "-b:a", "192k",

        "-shortest",
        "-movflags", "+faststart",

        outputPath
      ],
      {
        stdio: "inherit"
      }
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `Muxed MP4 was not created: ${outputPath}`
      );
    }

    const stat =
      fs.statSync(outputPath);

    if (stat.size <= 0) {
      throw new Error(
        "Muxed MP4 is empty"
      );
    }

    return {
      videoPath,
      audioPath,
      outputPath,
      size: stat.size
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = AudioMuxRenderer;
}
