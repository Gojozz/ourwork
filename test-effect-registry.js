const EffectRegistry =
  require("./engine/effect-registry");

const EffectHandler =
  require("./engine/effect-handler");

const registry =
  new EffectRegistry();

let executed = false;

const stopHandler =
  new EffectHandler(
    "earth.stop",
    context => {
      executed = true;

      return {
        action: "stop",
        time: context.time
      };
    }
  );

registry.register(
  "earth.stop",
  {
    description:
      "Stops Earth rotation",
    handler: stopHandler
  }
);

if (!registry.has("earth.stop")) {
  throw new Error(
    "EFFECT WAS NOT REGISTERED"
  );
}

const effect =
  registry.get("earth.stop");

if (!effect) {
  throw new Error(
    "EFFECT COULD NOT BE RESOLVED"
  );
}

if (
  effect.handler !== stopHandler
) {
  throw new Error(
    "HANDLER WAS NOT ATTACHED"
  );
}

const result =
  registry.execute(
    "earth.stop",
    {
      time: 12
    }
  );

if (!executed) {
  throw new Error(
    "HANDLER WAS NOT EXECUTED"
  );
}

if (
  result.action !== "stop" ||
  result.time !== 12
) {
  throw new Error(
    "INVALID HANDLER RESULT"
  );
}

let rejected = false;

try {
  registry.execute(
    "unknown.effect"
  );
} catch (error) {
  rejected = true;
}

if (!rejected) {
  throw new Error(
    "UNKNOWN EFFECT WAS NOT REJECTED"
  );
}

console.log(
  "===== EFFECT REGISTRY TEST ====="
);

console.log(
  "REGISTER: OK"
);

console.log(
  "HANDLER ATTACHMENT: OK"
);

console.log(
  "HANDLER EXECUTION: OK"
);

console.log(
  "UNKNOWN EFFECT: REJECTED"
);

console.log(
  "EFFECT REGISTRY: OK"
);
