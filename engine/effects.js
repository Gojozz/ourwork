/*
 * WHAT IF LAB
 * Effect Engine
 *
 * Registry efek reusable.
 *
 * Engine ini sengaja tidak langsung
 * bergantung pada Three.js.
 */

class EffectEngine {

  constructor() {

    this.effects = new Map();

  }

  register(name, handler) {

    if (
      typeof name !== "string" ||
      typeof handler !== "function"
    ) {
      throw new Error(
        "Invalid effect registration"
      );
    }

    this.effects.set(
      name,
      handler
    );
  }

  has(name) {

    return this.effects.has(name);

  }

  run(name, context = {}) {

    const effect =
      this.effects.get(name);

    if (!effect) {

      console.warn(
        `[WHAT IF LAB] Effect not found: ${name}`
      );

      return null;
    }

    return effect(context);
  }

  list() {

    return [
      ...this.effects.keys()
    ];

  }
}

if (typeof module !== "undefined") {
  module.exports = EffectEngine;
}
