const EffectContext =
  require("./effect-context");

const SimulationTimeline =
  require("./simulation-timeline");

const SimulationOperationEngine =
  require("./simulation-operation-engine");

class SimulationRenderer {
  constructor(options = {}) {
    this.registry =
      options.registry || null;

    this.timeline =
      options.timeline || null;

    this.operationEngine =
      options.operationEngine ||
      new SimulationOperationEngine();

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

  updateAtTime(time, options = {}) {
    if (
      !this.timeline
    ) {
      throw new Error(
        "Simulation timeline is not configured"
      );
    }

    const active =
      this.timeline.getActiveEvent(
        time
      );

    if (!active) {
      this.currentEffect = null;
      this.currentEvent = null;

      return null;
    }

    const result =
      this.update(
        active.event,
        {
          ...options,
          progress:
            active.progress
        }
      );

    return {
      ...result,
      progress:
        active.progress
    };
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
    const hasAction =
      event &&
      event.action &&
      typeof event.action === "object" &&
      !Array.isArray(event.action);

    if (hasAction) {
      const state = options.state;

      if (!state) {
        throw new Error(
          "Simulation state is required for action events"
        );
      }

      const changed =
        !this.currentEvent ||
        this.currentEvent.id !== event.id;

      this.currentEffect = null;

      if (!changed) {
        return {
          changed: false,
          effect: null,
          event,
          context: null,
          result: null,
          state: options.state
        };
      }

      this.currentEvent = event;

      const result =
        this.operationEngine.apply(
          state,
          event.action,
          {
            event,
            progress:
              options.progress !== undefined
                ? options.progress
                : 0,
            deltaTime:
              options.deltaTime !== undefined
                ? options.deltaTime
                : 0
          }
        );

      return {
        changed: true,
        effect: null,
        event,
        context: null,
        result,
        state: options.state
      };
    }

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
