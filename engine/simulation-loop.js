class SimulationLoop {
  constructor(options = {}) {
    this.timeline =
      options.timeline || null;

    this.renderer =
      options.renderer || null;

    this.state =
      options.state || null;
  }

  setTimeline(timeline) {
    if (
      !timeline ||
      typeof timeline.getActiveEvent !==
        "function"
    ) {
      throw new Error(
        "Simulation timeline is required"
      );
    }

    this.timeline = timeline;

    return this;
  }

  setRenderer(renderer) {
    if (
      !renderer ||
      typeof renderer.updateAtTime !==
        "function"
    ) {
      throw new Error(
        "Simulation renderer is required"
      );
    }

    this.renderer = renderer;

    return this;
  }

  setState(state) {
    if (
      !state ||
      typeof state.setTime !==
        "function"
    ) {
      throw new Error(
        "Simulation state is required"
      );
    }

    this.state = state;

    return this;
  }

  update(time) {
    if (
      typeof time !== "number" ||
      !Number.isFinite(time)
    ) {
      throw new Error(
        "Simulation time must be a finite number"
      );
    }

    if (time < 0) {
      throw new Error(
        "Simulation time cannot be negative"
      );
    }

    if (!this.timeline) {
      throw new Error(
        "Simulation timeline is not configured"
      );
    }

    if (!this.renderer) {
      throw new Error(
        "Simulation renderer is not configured"
      );
    }

    if (!this.state) {
      throw new Error(
        "Simulation state is not configured"
      );
    }

    this.state.setTime(time);

    return this.renderer.updateAtTime(
      time,
      {
        state: this.state
      }
    );
  }

  reset() {
    if (this.state) {
      this.state.reset();
    }

    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports = SimulationLoop;
}
