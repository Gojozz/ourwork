class ImageRenderer {
  constructor(options = {}) {
    this.frameRenderer =
      options.frameRenderer || null;

    this.renderImage =
      options.renderImage || null;
  }

  setFrameRenderer(frameRenderer) {
    if (
      !frameRenderer ||
      typeof frameRenderer.render !==
        "function"
    ) {
      throw new Error(
        "Frame renderer is required"
      );
    }

    this.frameRenderer =
      frameRenderer;

    return this;
  }

  setRenderImage(renderImage) {
    if (
      typeof renderImage !==
        "function"
    ) {
      throw new Error(
        "Image render function is required"
      );
    }

    this.renderImage =
      renderImage;

    return this;
  }

  render(options = {}) {
    if (!this.frameRenderer) {
      throw new Error(
        "Frame renderer is not configured"
      );
    }

    if (
      typeof this.renderImage !==
        "function"
    ) {
      throw new Error(
        "Image render function is not configured"
      );
    }

    const frames =
      this.frameRenderer.render(
        options
      );

    const images = [];

    for (
      const frame of frames
    ) {
      const image =
        this.renderImage({
          frame:
            frame.frame,
          time:
            frame.time,
          result:
            frame.result,
          output:
            frame.output
        });

      images.push({
        frame:
          frame.frame,
        time:
          frame.time,
        image,
        data:
          image &&
          typeof image === "object"
            ? image.data || image
            : image
      });
    }

    return images;
  }

  renderFrame(frame, options = {}) {
    if (
      !frame ||
      typeof frame !==
        "object"
    ) {
      throw new Error(
        "Frame is required"
      );
    }

    if (
      typeof this.renderImage !==
        "function"
    ) {
      throw new Error(
        "Image render function is not configured"
      );
    }

    return this.renderImage({
      ...frame,
      ...options
    });
  }

  reset() {
    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    ImageRenderer;
}
