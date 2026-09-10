const EffectHandler =
  require("./engine/effect-handler");

const EffectHandlerRegistry =
  require("./engine/effect-handler-registry");

const registry =
  new EffectHandlerRegistry();

let earthStopped = false;

const stopHandler =
  new EffectHandler(
    "earth.stop",
    context => {
      earthStopped = true;

      return {
        action: "stop",
        time: context.time
      };
    }
  );

registry.register(
  stopHandler
);

if (!registry.has("earth.stop")) {
  throw new Error(
    "HANDLER WAS NOT REGISTERED"
  );
}

if (
  registry.get("earth.stop") !==
  stopHandler
) {
  throw new Error(
    "HANDLER LOOKUP FAILED"
  );
}

const result =
  registry.execute(
    "earth.stop",
    {
      time: 15
    }
  );

if (!earthStopped) {
  throw new Error(
    "HANDLER WAS NOT EXECUTED"
  );
}

if (
  result.action !== "stop" ||
  result.time !== 15
) {
  throw new Error(
    "INVALID EXECUTION RESULT"
  );
}

const names =
  registry.names();

if (
  names.length !== 1 ||
  names[0] !== "earth.stop"
) {
  throw new Error(
    "INVALID HANDLER LIST"
  );
}

let duplicateRejected = false;

try {
  registry.register(
    new EffectHandler(
      "earth.stop",
      () => ({})
    )
  );
} catch (error) {
  duplicateRejected = true;
}

if (!duplicateRejected) {
  throw new Error(
    "DUPLICATE HANDLER WAS NOT REJECTED"
  );
}

console.log(
  "===== EFFECT HANDLER REGISTRY TEST ====="
);

console.log(
  "REGISTER: OK"
);

console.log(
  "LOOKUP: OK"
);

console.log(
  "EXECUTION: OK"
);

console.log(
  "LIST: OK"
);

console.log(
  "DUPLICATE: REJECTED"
);

console.log(
  "EFFECT HANDLER REGISTRY: OK"
);
