const EffectRegistry =
  require("./engine/effect-registry");

const EffectCatalogLoader =
  require("./engine/effect-catalog-loader");

const registry =
  new EffectRegistry();

registry.register(
  "physics.gravity.double"
);

registry.register(
  "biology.human.starvation"
);

const catalog =
  EffectCatalogLoader.fromRegistry(
    registry
  );

if (
  catalog.names().length !== 2
) {
  throw new Error(
    "CATALOG LOAD FAILED"
  );
}

if (
  !catalog.has(
    "physics.gravity.double"
  )
) {
  throw new Error(
    "GRAVITY EFFECT MISSING"
  );
}

if (
  !catalog.has(
    "biology.human.starvation"
  )
) {
  throw new Error(
    "BIOLOGY EFFECT MISSING"
  );
}

console.log(
  "===== EFFECT CATALOG LOADER TEST ====="
);

console.log(
  "REGISTRY → CATALOG: OK"
);

console.log(
  "EFFECT LOOKUP: OK"
);

console.log(
  "CATALOG COUNT: OK"
);

console.log(
  "EFFECT CATALOG LOADER: OK"
);
