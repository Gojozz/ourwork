class SimulationTimeline {
  constructor(events = []) {
    this.events = [];

    this.setEvents(events);
  }

  setEvents(events) {
    if (!Array.isArray(events)) {
      throw new Error(
        "Simulation timeline events must be an array"
      );
    }

    this.events = [...events];

    return this;
  }

  getEvents() {
    return [...this.events];
  }

  getActiveEvent(time) {
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

    const event =
      this.events.find(
        item =>
          time >= item.start &&
          time < item.end
      );

    if (!event) {
      return null;
    }

    const duration =
      event.end - event.start;

    const progress =
      duration > 0
        ? (time - event.start) / duration
        : 0;

    return {
      event,
      progress
    };
  }

  getDuration() {
    if (!this.events.length) {
      return 0;
    }

    return Math.max(
      ...this.events.map(
        event => event.end
      )
    );
  }

  reset() {
    this.events = [];
  }
}

if (typeof module !== "undefined") {
  module.exports = SimulationTimeline;
}
