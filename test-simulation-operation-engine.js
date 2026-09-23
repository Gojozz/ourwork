const SimulationState =
  require("./engine/simulation-state");

const SimulationOperationEngine =
  require("./engine/simulation-operation-engine");

console.log(
  "===== SIMULATION OPERATION ENGINE TEST ====="
);

const engine =
  new SimulationOperationEngine();

const state =
  new SimulationState({
    entities: {
      earth: {
        position: {
          x: 540,
          y: 960
        },
        appearance: {
          shape: "circle",
          radius: 250,
          rotation: 1,
          opacity: 1,
          color: "#4da6ff"
        }
      }
    },
    variables: {
      "earth.rotation": 1
    }
  });

// ------------------------------------------------------------
// Existing variable behavior
// ------------------------------------------------------------

let result =
  engine.apply(
    state,
    {
      domain: "earth",
      property: "rotation",
      operation: "set",
      value: 0
    }
  );

if (
  result.target !== "variable" ||
  state.getVariable("earth.rotation") !== 0
) {
  throw new Error(
    "VARIABLE SET FAILED"
  );
}

result =
  engine.apply(
    state,
    {
      domain: "earth",
      property: "rotation",
      operation: "add",
      value: 2
    }
  );

if (
  state.getVariable("earth.rotation") !== 2
) {
  throw new Error(
    "VARIABLE ADD FAILED"
  );
}

// ------------------------------------------------------------
// Entity set
// ------------------------------------------------------------

result =
  engine.apply(
    state,
    {
      domain: "entity.earth",
      property: "appearance.rotation",
      operation: "set",
      value: 0
    }
  );

if (
  result.target !== "entity" ||
  result.entityId !== "earth" ||
  state.getEntity("earth").appearance.rotation !== 0
) {
  throw new Error(
    "ENTITY SET FAILED"
  );
}

// ------------------------------------------------------------
// Entity add
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "appearance.rotation",
    operation: "add",
    value: 2
  }
);

if (
  state.getEntity("earth").appearance.rotation !== 2
) {
  throw new Error(
    "ENTITY ADD FAILED"
  );
}

// ------------------------------------------------------------
// Entity multiply
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "appearance.rotation",
    operation: "multiply",
    value: 3
  }
);

if (
  state.getEntity("earth").appearance.rotation !== 6
) {
  throw new Error(
    "ENTITY MULTIPLY FAILED"
  );
}

// ------------------------------------------------------------
// Entity subtract
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "appearance.rotation",
    operation: "subtract",
    value: 1
  }
);

if (
  state.getEntity("earth").appearance.rotation !== 5
) {
  throw new Error(
    "ENTITY SUBTRACT FAILED"
  );
}

// ------------------------------------------------------------
// Nested property creation
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "physics.velocity.x",
    operation: "set",
    value: 12
  }
);

if (
  state.getEntity("earth").physics.velocity.x !== 12
) {
  throw new Error(
    "NESTED ENTITY PROPERTY FAILED"
  );
}

// ------------------------------------------------------------
// Entity disable
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "visible",
    operation: "disable",
    value: null
  }
);

if (
  state.getEntity("earth").visible !== false
) {
  throw new Error(
    "ENTITY DISABLE FAILED"
  );
}

// ------------------------------------------------------------
// Entity enable
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "visible",
    operation: "enable",
    value: null
  }
);

if (
  state.getEntity("earth").visible !== true
) {
  throw new Error(
    "ENTITY ENABLE FAILED"
  );
}

// ------------------------------------------------------------
// Entity remove
// ------------------------------------------------------------

engine.apply(
  state,
  {
    domain: "entity.earth",
    property: "appearance.opacity",
    operation: "remove",
    value: null
  }
);

if (
  Object.prototype.hasOwnProperty.call(
    state.getEntity("earth").appearance,
    "opacity"
  )
) {
  throw new Error(
    "ENTITY REMOVE FAILED"
  );
}

// ------------------------------------------------------------
// Missing entity must be rejected
// ------------------------------------------------------------

let rejected =
  false;

try {
  engine.apply(
    state,
    {
      domain: "entity.moon",
      property: "appearance.radius",
      operation: "set",
      value: 100
    }
  );
} catch (error) {
  rejected = true;

  if (
    !error.message.includes(
      "Entity not found: moon"
    )
  ) {
    throw error;
  }
}

if (!rejected) {
  throw new Error(
    "MISSING ENTITY WAS NOT REJECTED"
  );
}

console.log(
  "VARIABLE ACTIONS: OK"
);

console.log(
  "ENTITY ACTIONS: OK"
);

console.log(
  "NESTED PROPERTIES: OK"
);

console.log(
  "REMOVE/ENABLE/DISABLE: OK"
);

console.log(
  "MISSING ENTITY: REJECTED"
);

console.log(
  "SIMULATION OPERATION ENGINE: OK"
);
