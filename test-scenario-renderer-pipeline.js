const ScenarioPipeline =
  require("./engine/scenario-pipeline");

const EffectRegistry =
  require("./engine/effect-registry");

const EffectHandler =
  require("./engine/effect-handler");

const SimulationState =
  require("./engine/simulation-state");

const EffectDefinition =
  require("./engine/effect-definition");

const pipeline =
  new ScenarioPipeline();

const registry =
  new EffectRegistry();

const handler =
  new EffectHandler(
    "test.effect",
    context => {
      context.state.setVariable(
        "rendered",
        true
      );

      return {
        rendered: true
      };
    }
  );

const definition =
  new EffectDefinition({
    name: "test.effect",
    domain: "test",
    description:
      "Test rendering effect",
    handler
  });

registry.register(definition);

pipeline.renderer.setRegistry(
  registry
);

const scenario = {
  id: "renderer-test",
  title: "Renderer Test",
  duration: 5,
  events: [
    {
      id: "event-1",
      start: 0,
      end: 5,
      effect: "test.effect"
    }
  ]
};

pipeline.generator.generate = () => ({
  prompt: "test",
  scenario
});

pipeline.validator.validate = () => ({
  valid: true,
  errors: []
});

const result =
  pipeline.process(
    {
      id: "renderer-test",
      title: "Renderer Test"
    },
    [],
    "{}"
  );

if (!result.validation.valid) {
  throw new Error(
    "Scenario validation failed"
  );
}

const state =
  new SimulationState();

const renderResult =
  pipeline.renderEvent(
    scenario.events[0],
    {
      state,
      deltaTime: 1,
      progress: 0.5
    }
  );

if (
  !renderResult.result ||
  renderResult.result.rendered !== true
) {
  throw new Error(
    "Renderer did not execute effect"
  );
}

if (
  state.getVariable("rendered") !== true
) {
  throw new Error(
    "Renderer did not update simulation state"
  );
}

console.log(
  "SCENARIO → RENDERER: OK"
);

console.log(
  "EFFECT EXECUTION: OK"
);

console.log(
  "SIMULATION STATE: OK"
);

console.log(
  "SCENARIO RENDERER PIPELINE: OK"
);
