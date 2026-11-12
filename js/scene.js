"use strict";

// Original, code-drawn four-frame sprite sheets. No downloads or dependencies.
(() => {
  const canvas = document.querySelector("#walking-scene");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const makeCanvas = (width, height) => {
    const surface = document.createElement("canvas");
    surface.width = width;
    surface.height = height;
    return surface;
  };
  const rect = (context, color, x, y, width, height) => {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
  };

  // Rasterize equal-width/equal-height discs with crisp, symmetric pixel steps.
  function pixelDisc(color, x, y, size) {
    const radius = size / 2;
    for (let row = 0; row < size; row++) {
      const dy = row + .5 - radius;
      const span = Math.sqrt(radius * radius - dy * dy);
      const left = Math.ceil(radius - span - .5);
      const right = Math.floor(radius + span - .5);
      rect(ctx, color, x + left, y + row, right - left + 1, 1);
    }
  }

  function creatorSheet() {
    const sheet = makeCanvas(96, 40);
    const pen = sheet.getContext("2d");
    for (let frame = 0; frame < 4; frame++) {
      pen.save();
      pen.translate(frame * 24, 0);
      const bob = frame % 2;
      const stride = [0, 3, 0, -3][frame];
      rect(pen, "#514536", 8 - stride, 28, 5, 10);
      rect(pen, "#514536", 12 + stride, 28, 5, 10);
      rect(pen, "#70533d", 8 - stride, 37, 7, 3);
      rect(pen, "#70533d", 12 + stride, 37, 7, 3);
      rect(pen, "#728296", 6, 15 + bob, 13, 15);
      rect(pen, "#a5b8bf", 6, 15 + bob, 4, 12);
      rect(pen, "#e7bf96", 8, 4 + bob, 12, 11);
      rect(pen, "#e7bf96", 19, 8 + bob, 3, 4); // Right-facing nose.
      rect(pen, "#624d3a", 7, 2 + bob, 13, 5);
      rect(pen, "#624d3a", 7, 6 + bob, 4, 6);
      rect(pen, "#514536", 18, 7 + bob, 2, 2);
      rect(pen, "#e7bf96", 12 + Math.sign(stride), 21 + bob, 4, 9);
      rect(pen, "#f1dfbc", 11, 15 + bob, 5, 2);
      pen.restore();
    }
    return sheet;
  }

  function dogSheet(fur, ruff) {
    const sheet = makeCanvas(144, 28);
    const pen = sheet.getContext("2d");
    for (let frame = 0; frame < 4; frame++) {
      pen.save();
      pen.translate(frame * 36, 0);
      const bob = frame % 2;
      const stride = [0, 2, 0, -2][frame];
      const tail = [0, -1, 0, 1][frame];
      rect(pen, "#947354", 3, 6 + tail, 9, 4);
      rect(pen, ruff, 1, 3 + tail, 8, 5);
      rect(pen, ruff, 1, 7 + tail, 4, 7);
      rect(pen, fur, 4, 11, 7, 5); // Curled plume tail, behind body.
      rect(pen, "#947354", 8, 13 + bob, 20, 11);
      rect(pen, fur, 7, 15 + bob, 20, 8);
      rect(pen, ruff, 11, 13 + bob, 13, 7);
      rect(pen, "#947354", 19, 4 + bob, 4, 6);
      rect(pen, "#947354", 27, 5 + bob, 3, 6);
      rect(pen, fur, 20, 6 + bob, 10, 4);
      rect(pen, "#947354", 17, 9 + bob, 16, 11);
      rect(pen, ruff, 18, 10 + bob, 14, 9);
      rect(pen, ruff, 21, 8 + bob, 9, 13); // Round fluffy cheek ruff.
      rect(pen, ruff, 30, 13 + bob, 5, 5);
      rect(pen, "#624d3a", 33, 13 + bob, 3, 3); // Muzzle points right.
      rect(pen, "#624d3a", 28, 11 + bob, 2, 2);
      rect(pen, "#728296", 18, 19 + bob, 5, 2);
      rect(pen, "#947354", 10 - stride, 22, 3, 5);
      rect(pen, "#947354", 23 + stride, 22, 3, 5);
      rect(pen, ruff, 10 - stride, 25, 5, 2);
      rect(pen, ruff, 23 + stride, 25, 5, 2);
      pen.restore();
    }
    return sheet;
  }

  const creator = creatorSheet();
  const dogs = [
    { sheet: dogSheet("#e4bd8d", "#fff0d4"), x: 52, y: 112, pace: 3.4, phase: 0 },
    { sheet: dogSheet("#f1dfbc", "#fff6e3"), x: 192, y: 108, pace: 3.9, phase: 1 },
    { sheet: dogSheet("#cda578", "#f1dfbc"), x: 255, y: 116, pace: 3.1, phase: 2 },
  ];
  let palette;
  let layers;
  let night;
  let elapsed = 0;
  let previousTime = null;
  let lastPaint = -Infinity;
  let animationFrame = null;

  function buildLandscape() {
    const styles = getComputedStyle(canvas);
    const color = (name) => styles.getPropertyValue(name).trim();
    night = document.body.classList.contains("theme-night");
    palette = {
      sky: color("--sky-top"), cloud: color("--cloud-fill"),
      mountain: color("--scene-mountain"), peak: color("--scene-peak"),
      tree: color("--scene-tree"), leaf: color("--scene-leaf"),
      grass: color("--scene-grass"), path: color("--scene-path"),
      trunk: color("--scene-trunk"),
    };
    layers = [makeCanvas(320, 160), makeCanvas(320, 160), makeCanvas(320, 160)];
    const mountains = layers[0].getContext("2d");
    [[0, 90, 60], [90, 66, 88], [210, 84, 64]].forEach(([x, y, width]) => {
      for (let step = 0; step < 6; step++) {
        rect(mountains, palette.mountain, x - step * 7, y + step * 7, width + step * 14, 60);
      }
      rect(mountains, palette.peak, x, y, width, 4);
    });
    const trees = layers[1].getContext("2d");
    [[26, 63], [132, 72], [256, 55]].forEach(([x, y]) => {
      rect(trees, palette.trunk, x + 12, y + 30, 7, 35);
      rect(trees, palette.tree, x, y + 8, 34, 31);
      rect(trees, palette.tree, x + 7, y, 20, 46);
      rect(trees, palette.leaf, x + 5, y + 9, 21, 14);
      rect(trees, palette.leaf, x + 10, y + 4, 13, 8);
    });
    const ground = layers[2].getContext("2d");
    rect(ground, palette.grass, 0, 116, 320, 44);
    rect(ground, palette.path, 0, 130, 320, 19);
    for (let x = 8; x < 320; x += 32) {
      rect(ground, palette.tree, x, 121, 2, 5);
      rect(ground, palette.tree, x + 3, 119, 2, 7);
      rect(ground, palette.trunk, x + 13, 139, 4, 1);
      rect(ground, palette.leaf, x + 5, 154, 5, 2);
    }
    [47, 171, 286].forEach((x) => {
      rect(ground, palette.tree, x + 2, 153, 2, 7);
      rect(ground, night ? "#b8bb96" : "#fff0d4", x, 150, 6, 4);
      rect(ground, "#c8aa65", x + 2, 151, 2, 2);
    });
  }

  function draw(time) {
    rect(ctx, palette.sky, 0, 0, 320, 160);
    // The sky follows the existing body theme; it has no separate theme state.
    if (night) {
      [[22, 24], [68, 13], [136, 35], [181, 16], [233, 28], [298, 11]].forEach(([x, y], index) => {
        ctx.globalAlpha = .65 + Math.sin(time * .8 + index) * .15;
        rect(ctx, "#f5efd0", x, y, 1, 1);
      });
      ctx.globalAlpha = 1;
    }
    const celestialY = 20 + Math.round(Math.sin(time * .8));
    pixelDisc(night ? "#bacad4" : "#e8ce8c", 264, celestialY - 2, 22);
    pixelDisc(night ? "#f5efd0" : "#fff0bd", 266, celestialY, 18);
    if (night) {
      pixelDisc("#d4d8c7", 269, celestialY + 3, 4);
      pixelDisc("#d4d8c7", 276, celestialY + 10, 5);
    }
    [[34, 29], [174, 45]].forEach(([x, y], index) => {
      const drift = Math.round(Math.sin(time * .4 + index) * 3);
      rect(ctx, palette.cloud, x + drift, y, 38, 7);
      rect(ctx, palette.cloud, x + 7 + drift, y - 5, 24, 8);
    });
    // Repeating 320px tiles wrap at exactly one tile width, without a seam.
    layers.forEach((layer, index) => {
      const offset = Math.floor(time * [2, 5, 12][index]) % 320;
      ctx.drawImage(layer, -offset, 0);
      ctx.drawImage(layer, 320 - offset, 0);
    });
    const personFrame = Math.floor(time * 3.5) % 4;
    ctx.drawImage(creator, personFrame * 24, 0, 24, 40, 137, 92, 24, 40);
    dogs.forEach((dog) => {
      const frame = Math.floor(time * dog.pace + dog.phase) % 4;
      ctx.drawImage(dog.sheet, frame * 36, 0, 36, 28, dog.x, dog.y, 36, 28);
    });
  }

  function tick(timestamp) {
    if (previousTime !== null) elapsed += Math.min(timestamp - previousTime, 100) / 1000;
    previousTime = timestamp;
    // A small 20fps scene is sufficient for this intentionally pixel-stepped walk.
    if (timestamp - lastPaint >= 50) {
      draw(elapsed);
      lastPaint = timestamp;
    }
    animationFrame = requestAnimationFrame(tick);
  }

  function syncPlayback() {
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    previousTime = null;
    lastPaint = -Infinity;
    document.documentElement.classList.toggle("page-hidden", document.hidden);
    if (document.hidden) return;
    if (reducedMotion.matches) draw(0);
    else animationFrame = requestAnimationFrame(tick);
  }

  new MutationObserver(() => {
    buildLandscape();
    if (!document.hidden) draw(reducedMotion.matches ? 0 : elapsed);
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  document.addEventListener("visibilitychange", syncPlayback);
  reducedMotion.addEventListener("change", syncPlayback);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(animationFrame);
    previousTime = null;
  });
  window.addEventListener("pageshow", syncPlayback);
  buildLandscape();
  draw(0);
  syncPlayback();
})();
