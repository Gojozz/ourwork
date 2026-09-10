class VisualStateRenderer {
  constructor(options = {}) {
    this.width =
      options.width !== undefined
        ? options.width
        : 1080;

    this.height =
      options.height !== undefined
        ? options.height
        : 1920;
  }

  render(ctx, state, options = {}) {
    if (!ctx) {
      throw new Error(
        "Canvas context is required"
      );
    }

    if (!state) {
      throw new Error(
        "Simulation state is required"
      );
    }

    const background =
      options.background ||
      "#050914";

    ctx.fillStyle =
      background;

    ctx.fillRect(
      0,
      0,
      this.width,
      this.height
    );

    const entities =
      state.entities || {};

    const rendered = [];

    for (
      const [id, entity]
      of Object.entries(entities)
    ) {
      if (
        !entity ||
        typeof entity !== "object"
      ) {
        continue;
      }

      const position =
        entity.position &&
        typeof entity.position === "object"
          ? entity.position
          : {};

      const appearance =
        entity.appearance &&
        typeof entity.appearance === "object"
          ? entity.appearance
          : {};

      const x =
        Number.isFinite(entity.x)
          ? entity.x
          : Number.isFinite(position.x)
            ? position.x
            : this.width / 2;

      const y =
        Number.isFinite(entity.y)
          ? entity.y
          : Number.isFinite(position.y)
            ? position.y
            : this.height / 2;

      const radius =
        Number.isFinite(entity.radius)
          ? entity.radius
          : Number.isFinite(
              appearance.radius
            )
            ? appearance.radius
            : 80;

      const width =
        Number.isFinite(entity.width)
          ? entity.width
          : Number.isFinite(
              appearance.width
            )
            ? appearance.width
            : radius * 2;

      const height =
        Number.isFinite(entity.height)
          ? entity.height
          : Number.isFinite(
              appearance.height
            )
            ? appearance.height
            : radius * 2;

      const shape =
        appearance.shape ||
        entity.shape ||
        "circle";

      const fill =
        appearance.color ||
        entity.color ||
        options.objectColor ||
        "#4da6ff";

      const opacity =
        Number.isFinite(
          appearance.opacity
        )
          ? appearance.opacity
          : 1;

      const rotation =
        Number.isFinite(
          appearance.rotation
        )
          ? appearance.rotation
          : Number.isFinite(entity.rotation)
            ? entity.rotation
            : 0;

      ctx.save();

      ctx.globalAlpha =
        Math.max(
          0,
          Math.min(
            1,
            opacity
          )
        );

      ctx.fillStyle =
        fill;

      ctx.strokeStyle =
        appearance.strokeColor ||
        entity.strokeColor ||
        fill;

      ctx.lineWidth =
        Number.isFinite(
          appearance.strokeWidth
        )
          ? appearance.strokeWidth
          : Number.isFinite(
              entity.strokeWidth
            )
            ? entity.strokeWidth
            : 0;

      ctx.translate(
        x,
        y
      );

      if (rotation !== 0) {
        ctx.rotate(rotation);
      }

      if (shape === "circle") {
        ctx.beginPath();

        ctx.arc(
          0,
          0,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fill();

        if (ctx.lineWidth > 0) {
          ctx.stroke();
        }

        ctx.closePath();
      } else if (
        shape === "square" ||
        shape === "rectangle"
      ) {
        ctx.fillRect(
          -width / 2,
          -height / 2,
          width,
          height
        );

        if (ctx.lineWidth > 0) {
          ctx.strokeRect(
            -width / 2,
            -height / 2,
            width,
            height
          );
        }
      } else if (shape === "line") {
        const lineLength =
          Number.isFinite(
            appearance.length
          )
            ? appearance.length
            : Number.isFinite(
                entity.length
              )
              ? entity.length
              : width;

        ctx.beginPath();

        ctx.moveTo(
          -lineLength / 2,
          0
        );

        ctx.lineTo(
          lineLength / 2,
          0
        );

        ctx.stroke();

        ctx.closePath();
      }

      ctx.restore();

      rendered.push({
        id,
        shape,
        x,
        y,
        radius,
        width,
        height,
        color: fill,
        opacity,
        rotation
      });
    }

    return {
      rendered:
        rendered.length > 0,

      count:
        rendered.length,

      entities:
        rendered
    };
  }
}

if (typeof module !== "undefined") {
  module.exports =
    VisualStateRenderer;
}
