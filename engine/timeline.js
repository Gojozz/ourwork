/*
 * WHAT IF LAB
 * Timeline Engine
 *
 * Tugas:
 * Menentukan event aktif berdasarkan waktu simulasi.
 *
 * Tidak bergantung pada Three.js.
 */

class TimelineEngine {

  constructor(events = []) {
    this.events = events;
    this.activeEventId = null;
  }

  getEvent(time) {

    for (const event of this.events) {

      if (
        time >= event.start &&
        time < event.end
      ) {
        return event;
      }
    }

    return null;
  }

  update(time) {

    const event = this.getEvent(time);

    let changed = false;

    if (
      event &&
      event.id !== this.activeEventId
    ) {
      this.activeEventId = event.id;
      changed = true;
    }

    return {
      event,
      changed
    };
  }

  reset() {
    this.activeEventId = null;
  }
}

if (typeof module !== "undefined") {
  module.exports = TimelineEngine;
}
