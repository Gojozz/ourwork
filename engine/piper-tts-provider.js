const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

class PiperTTSProvider {
  constructor(options = {}) {
    this.command =
      options.command || "piper";

    this.model =
      options.model || "en_US-lessac-medium";

    this.dataDir =
      options.dataDir || null;

    this.outputDir =
      options.outputDir || "output/audio";

    this.sentenceSilence =
      options.sentenceSilence !== undefined
        ? options.sentenceSilence
        : 0.15;
  }

  synthesize(text, options = {}) {
    if (
      typeof text !== "string" ||
      !text.trim()
    ) {
      throw new Error("TTS text is required");
    }

    const outputPath =
      options.outputPath ||
      path.join(
        this.outputDir,
        "narration.wav"
      );

    fs.mkdirSync(
      path.dirname(outputPath),
      { recursive: true }
    );

    const args = [];

    if (this.dataDir) {
      args.push(
        "--data-dir",
        this.dataDir
      );
    }

    args.push(
      "--model",
      options.model || this.model
    );

    const silence =
      options.sentenceSilence !== undefined
        ? options.sentenceSilence
        : this.sentenceSilence;

    if (
      typeof silence === "number" &&
      Number.isFinite(silence) &&
      silence > 0
    ) {
      args.push(
        "--sentence-silence",
        String(silence)
      );
    }

    args.push(
      "--output_file",
      outputPath
    );

    execFileSync(
      this.command,
      args,
      {
        input: `${text.trim()}\n`,
        stdio: [
          "pipe",
          "inherit",
          "inherit"
        ]
      }
    );

    if (!fs.existsSync(outputPath)) {
      throw new Error(
        `Piper audio was not created: ${outputPath}`
      );
    }

    const stat =
      fs.statSync(outputPath);

    if (stat.size <= 0) {
      throw new Error(
        "Piper audio file is empty"
      );
    }

    return {
      audioPath: outputPath,
      model:
        options.model || this.model,
      size: stat.size
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = PiperTTSProvider;
}
