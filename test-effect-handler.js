const EffectHandler =
  require("./engine/effect-handler");

let executed = false;
let receivedContext = null;

const handler =
  new EffectHandler(
    "earth.stop",
    context => {
      executed = true;
      receivedContext = context;

      return {
        stopped: true
      };
    }
  );

const context = {
  simulationTime: 12,
  objects: {
    earth: {}
  }
};

const result =
  handler.execute(context);

if (!executed) {
  throw new Error(
    "HANDLER WAS NOT EXECUTED"
  );
}

if (
  receivedContext !== context
) {
  throw new Error(
    "CONTEXT WAS NOT PASSED"
  );
}

if (
  !result ||
  result.stopped !== true
) {
  throw new Error(
    "INVALID HANDLER RESULT"
  );
}

const second =
  new EffectHandler(
    "earth.test"
  );

let rejected = false;

try {
  second.execute();
} catch (error) {
  rejected = true;
}

if (!rejected) {
  throw new Error(
    "UNCONFIGURED HANDLER WAS NOT REJECTED"
  );
}

let invalidRejected = false;

try {
  new EffectHandler(
    "bad",
    "not-a-function"
  );
} catch (error) {
  invalidRejected = true;
}

if (!invalidRejected) {
  throw new Error(
    "INVALID HANDLER WAS NOT REJECTED"
  );
}

console.log(
  "===== EFFECT HANDLER TEST ====="
);

console.log(
  "EXECUTION: OK"
);

console.log(
  "CONTEXT: OK"
);

console.log(
  "UNCONFIGURED HANDLER: REJECTED"
);

console.log(
  "INVALID HANDLER: REJECTED"
);

console.log(
  "EFFECT HANDLER: OK"
);
