const EffectHandler =
  require("../../effect-handler");

class GravityDoubleHandler
  extends EffectHandler {

  constructor(options = {}) {
    super(
      "physics.gravity.double",
      context =>
        this.executeGravityDouble(
          context
        )
    );

    this.multiplier =
      options.multiplier !== undefined
        ? options.multiplier
        : 2;
  }

  executeGravityDouble(context = {}) {
    if (!context.state) {
      throw new Error(
        "Simulation state is required"
      );
    }

    const currentGravity =
      Number(
        context.getVariable("gravity")
      );

    if (
      !Number.isFinite(currentGravity)
    ) {
      throw new Error(
        "Gravity variable must be a finite number"
      );
    }

    const newGravity =
      currentGravity *
      this.multiplier;

    context.state.setVariable(
      "gravity",
      newGravity
    );

    context.state.setVariable(
      "gravityMultiplier",
      this.multiplier
    );

    return {
      effect: this.name,
      state: "gravity-doubled",
      previousGravity:
        currentGravity,
      gravity:
        newGravity,
      multiplier:
        this.multiplier
    };
  }
}

if (typeof module !== "undefined") {
  module.exports = GravityDoubleHandler;
}
