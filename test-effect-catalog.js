const EffectCatalog =
  require("./engine/effect-catalog");

const EffectDefinition =
  require("./engine/effect-definition");

const catalog =
  new EffectCatalog();

const gravity =
  new EffectDefinition({
    name:
      "physics.gravity.double",
    domain:
      "physics",
    description:
      "Doubles gravitational strength"
  });

const starvation =
  new EffectDefinition({
    name:
      "biology.human.starvation",
    domain:
      "biology",
    description:
      "Simulates prolonged human starvation"
  });

const atmosphere =
  new EffectDefinition({
    name:
      "environment.atmosphere.disappear",
    domain:
      "environment",
    description:
      "Removes the atmosphere"
  });

catalog.register(gravity);
catalog.register(starvation);
catalog.register(atmosphere);

if (
  !catalog.has(
    "physics.gravity.double"
  )
) {
  throw new Error(
    "CATALOG LOOKUP FAILED"
  );
}

if (
  catalog.get(
    "physics.gravity.double"
  ) !== gravity
) {
  throw new Error(
    "DEFINITION PRESERVATION FAILED"
  );
}

if (
  catalog.names().length !== 3
) {
  throw new Error(
    "CATALOG COUNT FAILED"
  );
}

if (
  catalog.domains().length !== 3
) {
  throw new Error(
    "DOMAIN DISCOVERY FAILED"
  );
}

if (
  catalog.byDomain("physics").length !== 1
) {
  throw new Error(
    "DOMAIN FILTER FAILED"
  );
}

const json =
  catalog.toJSON();

if (
  !Array.isArray(json) ||
  json.length !== 3
) {
  throw new Error(
    "SERIALIZATION FAILED"
  );
}

console.log(
  "===== EFFECT CATALOG TEST ====="
);

console.log(
  "REGISTRATION: OK"
);

console.log(
  "LOOKUP: OK"
);

console.log(
  "DEFINITION PRESERVATION: OK"
);

console.log(
  "DOMAIN DISCOVERY: OK"
);

console.log(
  "DOMAIN FILTER: OK"
);

console.log(
  "SERIALIZATION: OK"
);

console.log(
  "EFFECT CATALOG: OK"
);
