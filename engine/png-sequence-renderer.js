const fs = require("fs");
const path = require("path");

class PNGSequenceRenderer {
  constructor(options = {}) {
    this.imageRenderer =
      options.imageRenderer || null;

    this.backend =
      options.backend || null;
  }

  setImageRenderer(imageRenderer) {
    if (
      !imageRenderer ||
      typeof imageRenderer.render !==
        "function"
    ) {
      throw new Error(
        "Image renderer is required"
      );
    }

    this.imageRenderer =
      imageRenderer;

    return this;
  }

  setBackend(backend) {
    if (
      !backend ||
      typeof backend.render !==
        "function"
    ) {
      throw new Error(
        "Image backend is required"
      );
    }

    this.backend =
      backend;

    return this;
  }

  render(options = {}) {
    if (!this.imageRenderer) {
      throw new Error(
        "Image renderer is not configured"
      );
    }

    if (!this.backend) {
      throw new Error(
        "Image backend is not configured"
      );
    }

    const outputDir =
      options.outputDir;

    if (!outputDir) {
      throw new Error(
        "Output directory is required"
      );
    }

    fs.mkdirSync(
      outputDir,
      {
        recursive: true
      }
    );

    const images =
      this.imageRenderer.render(
        options
      );

    const rendered = [];

    for (const image of images) {
      const frame =
        image.frame;

      const time =
        image.time;

      const outputPath =
        path.join(
          outputDir,
          `frame-${String(frame).padStart(6, "0")}.png`
        );

      const result =
        this.backend.render({
          frame,
          time,
          outputPath,

          draw:
            options.draw,

          data:
            image.data
        });

      rendered.push({
        frame,
        time,
        outputPath,
        result
      });
    }

    return rendered;
  }

  reset() {
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    PNGSequenceRenderer;
}
