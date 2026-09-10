function canvasVisualDraw(ctx, canvas, options = {}) {
  const width = options.width || canvas.width;
  const height = options.height || canvas.height;

  const background =
    options.background ||
    "#050914";

  ctx.fillStyle = background;
  ctx.fillRect(
    0,
    0,
    width,
    height
  );

  const state =
    options.state ||
    options.data ||
    {};

  const entities =
    state.entities || {};

  for (
    const entity of Object.values(entities)
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
          : width / 2;

    const y =
      Number.isFinite(entity.y)
        ? entity.y
        : Number.isFinite(position.y)
          ? position.y
          : height / 2;

    const radius =
      Number.isFinite(entity.radius)
        ? entity.radius
        : Number.isFinite(appearance.radius)
          ? appearance.radius
          : 80;

    const entityWidth =
      Number.isFinite(entity.width)
        ? entity.width
        : Number.isFinite(appearance.width)
          ? appearance.width
          : radius * 2;

    const entityHeight =
      Number.isFinite(entity.height)
        ? entity.height
        : Number.isFinite(appearance.height)
          ? appearance.height
          : radius * 2;

    const shape =
      appearance.shape ||
      entity.shape ||
      "circle";

    const fill =
      appearance.color ||
      entity.color ||
      "#4da6ff";

    const opacity =
      Number.isFinite(appearance.opacity)
        ? appearance.opacity
        : 1;

    const rotation =
      Number.isFinite(appearance.rotation)
        ? appearance.rotation
        : Number.isFinite(entity.rotation)
          ? entity.rotation
          : 0;

    ctx.save();

    ctx.globalAlpha =
      Math.max(
        0,
        Math.min(1, opacity)
      );

    ctx.fillStyle = fill;

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

    ctx.translate(x, y);

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
        -entityWidth / 2,
        -entityHeight / 2,
        entityWidth,
        entityHeight
      );

      if (ctx.lineWidth > 0) {
        ctx.strokeRect(
          -entityWidth / 2,
          -entityHeight / 2,
          entityWidth,
          entityHeight
        );
      }
    } else if (shape === "line") {
      const length =
        Number.isFinite(
          appearance.length
        )
          ? appearance.length
          : Number.isFinite(
              entity.length
            )
            ? entity.length
            : entityWidth;

      ctx.beginPath();

      ctx.moveTo(
        -length / 2,
        0
      );

      ctx.lineTo(
        length / 2,
        0
      );

      ctx.stroke();

      ctx.closePath();
    }

    ctx.restore();
  }

  return {
    rendered: true,
    count: Object.keys(entities).length
  };
}

if (typeof module !== "undefined") {
  module.exports = canvasVisualDraw;
}
