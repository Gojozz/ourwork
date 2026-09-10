class EffectContext {
  constructor(options = {}) {
    this.state =
      options.state || null;

    this.event =
      options.event || null;

    this.effect =
      options.effect || null;

    this.deltaTime =
      options.deltaTime !== undefined
        ? options.deltaTime
        : 0;

    this.progress =
      options.progress !== undefined
        ? options.progress
        : 0;

    this.renderer =
      options.renderer || null;
  }

  getTime() {
    if (
      !this.state ||
      typeof this.state.getTime !== "function"
    ) {
      return 0;
    }

    return this.state.getTime();
  }

  getEntity(id) {
    if (
      !this.state ||
      typeof this.state.getEntity !== "function"
    ) {
      return null;
    }

    return this.state.getEntity(id);
  }

  getVariable(name) {
    if (
      !this.state ||
      typeof this.state.getVariable !== "function"
    ) {
      return null;
    }

    return this.state.getVariable(name);
  }

  snapshot() {
    return {
      time: this.getTime(),
      deltaTime: this.deltaTime,
      progress: this.progress,
      event: this.event,
      effect: this.effect,
      state:
        this.state &&
        typeof this.state.snapshot === "function"
          ? this.state.snapshot()
          : null
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = EffectContext;
}
