const SimulationState = require("./simulation-state");
const SimulationTimeline = require("./simulation-timeline");
const SimulationRenderer = require("./simulation-renderer");
const SimulationLoop = require("./simulation-loop");
const FrameRenderer = require("./frame-renderer");
const ImageRenderer = require("./image-renderer");
const CanvasImageBackend = require("./canvas-image-backend");
const PNGSequenceRenderer = require("./png-sequence-renderer");
const MP4Renderer = require("./mp4-renderer");
const canvasVisualDraw =
  require("./canvas-visual-draw");

class SimulationRenderPipeline {
  constructor(options = {}) {
    this.state =
      options.state ||
      new SimulationState(options.stateOptions);

    this.timeline =
      options.timeline ||
      new SimulationTimeline();

    this.simulationRenderer =
      options.simulationRenderer ||
      new SimulationRenderer(
        options.simulationRendererOptions
      );

    this.loop =
      options.loop ||
      new SimulationLoop({
        timeline: this.timeline,
        renderer: this.simulationRenderer,
        state: this.state
      });

    this.frameRenderer =
      options.frameRenderer ||
      new FrameRenderer();

    this.imageRenderer =
      options.imageRenderer ||
      new ImageRenderer();

    this.backend =
      options.backend ||
      new CanvasImageBackend(
        options.backendOptions
      );

    this.pngRenderer =
      options.pngRenderer ||
      new PNGSequenceRenderer();

    this.mp4Renderer =
      options.mp4Renderer ||
      new MP4Renderer(
        options.mp4Options
      );
  }

  configure(scenario) {
    if (
      !scenario ||
      typeof scenario !== "object"
    ) {
      throw new Error(
        "Scenario is required"
      );
    }

    if (!Array.isArray(scenario.events)) {
      throw new Error(
        "Scenario events are required"
      );
    }

    this.timeline.setEvents(
      scenario.events
    );

    // Initialize simulation state from the
    // declarative scenario initialState.
    this.state.reset();

    const initialState =
      scenario.initialState &&
      typeof scenario.initialState === "object" &&
      !Array.isArray(scenario.initialState)
        ? scenario.initialState
        : {};

    const entities =
      initialState.entities &&
      typeof initialState.entities === "object" &&
      !Array.isArray(initialState.entities)
        ? initialState.entities
        : {};

    const variables =
      initialState.variables &&
      typeof initialState.variables === "object" &&
      !Array.isArray(initialState.variables)
        ? initialState.variables
        : {};

    for (const [id, entity] of Object.entries(entities)) {
      this.state.setEntity(id, entity);
    }

    for (const [name, value] of Object.entries(variables)) {
      this.state.setVariable(name, value);
    }

    this.simulationRenderer
      .setTimeline(this.timeline);

    this.loop
      .setTimeline(this.timeline)
      .setRenderer(this.simulationRenderer)
      .setState(this.state);

    return this;
  }

  render(options = {}) {
    const fps =
      options.fps !== undefined
        ? options.fps
        : 30;

    const duration =
      options.duration !== undefined
        ? options.duration
        : this.timeline.getDuration();

    const outputDir =
      options.outputDir;

    const outputPath =
      options.outputPath;

    if (!outputDir) {
      throw new Error(
        "Output directory is required"
      );
    }

    if (!outputPath) {
      throw new Error(
        "Output path is required"
      );
    }

    const draw =
      options.draw ||
      canvasVisualDraw;

    this.frameRenderer
      .setLoop(this.loop)
      .setRenderFrame(
        ({
          frame,
          time,
          result
        }) => ({
          frame,
          time,
          result,
          data:
            result &&
            result.state &&
            typeof result.state.snapshot ===
              "function"
              ? result.state.snapshot()
              : result &&
                result.state
                ? result.state
                : {}
        })
      );

    this.imageRenderer
      .setFrameRenderer(
        this.frameRenderer
      )
      .setRenderImage(
        ({
          frame,
          time,
          result,
          output
        }) => ({
          frame,
          time,
          result,
          output,
          data:
            result &&
            result.state &&
            typeof result.state.snapshot ===
              "function"
              ? result.state.snapshot()
              : result &&
                result.state
                ? result.state
                : {}
        })
      );

    this.pngRenderer
      .setImageRenderer(
        this.imageRenderer
      )
      .setBackend(this.backend);

    const pngFrames =
      this.pngRenderer.render({
        fps,
        duration,
        outputDir,
        draw
      });

    const mp4 =
      this.mp4Renderer.render({
        inputDir: outputDir,
        outputPath,
        fps
      });

    return {
      fps,
      duration,
      frames: pngFrames,
      mp4
    };
  }

  reset() {
    this.state.reset();
    this.timeline.reset();
    this.simulationRenderer.reset();
    this.loop.reset();
    this.frameRenderer.reset();
    this.imageRenderer.reset();
    this.pngRenderer.reset();

    return this;
  }
}

if (typeof module !== "undefined") {
  module.exports =
    SimulationRenderPipeline;
}
