const EffectDefinition =
  require("./engine/effect-definition");

const EffectHandler =
  require("./engine/effect-handler");

let executed = false;

const handler =
  new EffectHandler(
    "physics.gravity.double",
    context => {
      executed = true;

      return {
        ok: true,
        time:
          context.getTime()
      };
    }
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
      version: 1,
      visual: true
    }
  });

if (
  definition.name !==
  "physics.gravity.double"
) {
  throw new Error(
    "NAME INVALID"
  );
}

if (
  definition.domain !==
  "physics"
) {
  throw new Error(
    "DOMAIN INVALID"
  );
}

if (
  definition.description !==
  "Doubles gravitational acceleration"
) {
  throw new Error(
    "DESCRIPTION INVALID"
  );
}

if (!definition.hasHandler()) {
  throw new Error(
    "HANDLER WAS NOT ATTACHED"
  );
}

const context = {
  getTime() {
    return 10;
  }
};

const result =
  definition.execute(context);

if (!executed) {
  throw new Error(
    "HANDLER WAS NOT EXECUTED"
  );
}

if (
  !result ||
  result.ok !== true ||
  result.time !== 10
) {
  throw new Error(
    "EXECUTION RESULT INVALID"
  );
}

const json =
  definition.toJSON();

if (
  json.name !==
  "physics.gravity.double"
) {
  throw new Error(
    "JSON NAME INVALID"
  );
}

if (
  json.domain !== "physics"
) {
  throw new Error(
    "JSON DOMAIN INVALID"
  );
}

if (
  json.metadata.version !== 1
) {
  throw new Error(
    "JSON METADATA INVALID"
  );
}

console.log(
  "===== EFFECT DEFINITION TEST ====="
);

console.log(
  "NAME: OK"
);

console.log(
  "DOMAIN: OK"
);

console.log(
  "DESCRIPTION: OK"
);

console.log(
  "HANDLER: OK"
);

console.log(
  "EXECUTION: OK"
);

console.log(
  "METADATA: OK"
);

console.log(
  "SERIALIZATION: OK"
);

console.log(
  "EFFECT DEFINITION: OK"
);
