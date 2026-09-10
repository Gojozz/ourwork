class FrameRenderer {
  constructor(options = {}) {
    this.loop =
      options.loop || null;

    this.renderFrame =
      options.renderFrame || null;
  }

  setLoop(loop) {
    if (
      !loop ||
      typeof loop.renderFrames !==
        "function"
    ) {
      throw new Error(
        "Simulation loop is required"
      );
    }

    this.loop = loop;

    return this;
  }

  setRenderFrame(renderFrame) {
    if (
      typeof renderFrame !==
        "function"
    ) {
      throw new Error(
        "Frame render function is required"
      );
    }

    this.renderFrame =
      renderFrame;

    return this;
  }

  render(options = {}) {
    if (!this.loop) {
      throw new Error(
        "Simulation loop is not configured"
      );
    }

    if (
      typeof this.renderFrame !==
        "function"
    ) {
      throw new Error(
        "Frame render function is not configured"
      );
    }

    const frames =
      this.loop.renderFrames(
        options
      );

    const rendered = [];

    for (
      const frame of frames
    ) {
      const output =
        this.renderFrame({
          frame:
            frame.frame,
          time:
            frame.time,
          result:
            frame.result
        });

      rendered.push({
        frame:
          frame.frame,
        time:
          frame.time,
        result:
          frame.result,
        output
      });
    }

    return rendered;
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
      typeof this.renderFrame !==
        "function"
    ) {
      throw new Error(
        "Frame render function is not configured"
      );
    }

    return this.renderFrame({
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
    FrameRenderer;
}
