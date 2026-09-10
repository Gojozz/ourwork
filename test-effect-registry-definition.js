const EffectRegistry =
  require("./engine/effect-registry");

const EffectDefinition =
  require("./engine/effect-definition");

const EffectHandler =
  require("./engine/effect-handler");

const registry =
  new EffectRegistry();

const handler =
  new EffectHandler(
    "physics.gravity.double",
    context => ({
      ok: true,
      time:
        context.getTime()
    })
  );

const definition =
  new EffectDefinition({
    name:
      "physics.gravity.double",

    domain:
      "physics",

    description:
      "Doubles gravitational acceleration",

    handler,

    metadata: {
      version: 1
    }
  });

registry.register(
  definition
);

if (
  !registry.has(
    "physics.gravity.double"
  )
) {
  throw new Error(
    "DEFINITION WAS NOT REGISTERED"
  );
}

const stored =
  registry.get(
    "physics.gravity.double"
  );

if (
  stored !== definition
) {
  throw new Error(
    "DEFINITION INSTANCE WAS NOT PRESERVED"
  );
}

if (
  stored.domain !== "physics"
) {
  throw new Error(
    "DOMAIN WAS NOT PRESERVED"
  );
}

const result =
  registry.execute(
    "physics.gravity.double",
    {
      getTime() {
        return 20;
      }
    }
  );

if (
  !result ||
  result.ok !== true ||
  result.time !== 20
) {
  throw new Error(
    "EXECUTION FAILED"
  );
}

const definitions =
  registry.definitions();

if (
  !Array.isArray(definitions) ||
  definitions.length !== 1
) {
  throw new Error(
    "DEFINITION CATALOG INVALID"
  );
}

if (
  definitions[0].name !==
  "physics.gravity.double"
) {
  throw new Error(
    "CATALOG NAME INVALID"
  );
}

if (
  definitions[0].domain !==
  "physics"
) {
  throw new Error(
    "CATALOG DOMAIN INVALID"
  );
}

console.log(
  "===== EFFECT REGISTRY DEFINITION TEST ====="
);

console.log(
  "DEFINITION REGISTRATION: OK"
);

console.log(
  "DEFINITION PRESERVATION: OK"
);

console.log(
  "DOMAIN METADATA: OK"
);

console.log(
  "EXECUTION: OK"
);

console.log(
  "CATALOG: OK"
);

console.log(
  "EFFECT REGISTRY DEFINITION: OK"
);
