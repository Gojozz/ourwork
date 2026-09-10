const EffectContext =
  require("./effect-context");

class SimulationRenderer {
  constructor(options = {}) {
    this.registry =
      options.registry || null;

    this.currentEffect = null;
    this.currentEvent = null;
  }

  setRegistry(registry) {
    if (!registry) {
      throw new Error(
        "Effect registry is required"
      );
    }

    this.registry = registry;

    return this;
  }

  resolveEffect(event) {
    if (
      !event ||
      typeof event !== "object"
    ) {
      return null;
    }

    if (
      typeof event.effect !== "string" ||
      !event.effect.trim()
    ) {
      return null;
    }

    if (!this.registry) {
      throw new Error(
        "Effect registry is not configured"
      );
    }

    const effect =
      this.registry.get(event.effect);

    if (!effect) {
      throw new Error(
        `Unregistered effect: ${event.effect}`
      );
    }

    return effect;
  }

  createContext(
    event,
    effect,
    options = {}
  ) {
    return new EffectContext({
      state: options.state || null,
      event,
      effect,
      deltaTime:
        options.deltaTime !== undefined
          ? options.deltaTime
          : 0,
      progress:
        options.progress !== undefined
          ? options.progress
          : 0,
      renderer:
        options.renderer || this
    });
  }

  update(event, options = {}) {
    const effect =
      this.resolveEffect(event);

    if (!effect) {
      this.currentEffect = null;
      this.currentEvent = null;

      return {
        changed: false,
        effect: null,
        event: null,
        context: null,
        result: null
      };
    }

    const changed =
      !this.currentEvent ||
      this.currentEvent.id !== event.id;

    this.currentEffect = effect;
    this.currentEvent = event;

    const context =
      this.createContext(
        event,
        effect,
        options
      );

    let result = null;

    if (
      effect.handler &&
      typeof effect.handler.execute ===
        "function"
    ) {
      result =
        effect.handler.execute(
          context
        );
    }

    return {
      changed,
      effect,
      event,
      context,
      result
    };
  }

  reset() {
    this.currentEffect = null;
    this.currentEvent = null;
  }
}

if (typeof module !== "undefined") {
  module.exports = SimulationRenderer;
}
