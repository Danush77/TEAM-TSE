// Keeps the supplied Exaze-to-TSE SVG morph self-contained and lightweight.
document.querySelectorAll("[data-logo-morph]").forEach((stage) => {
  const L = (a, b, c, d) => [a + (c - a) / 3, b + (d - b) / 3, a + (c - a) * 2 / 3, b + (d - b) * 2 / 3, c, d];
  const mid = (a, b) => (a + b) / 2;

  function split(x, y, segment) {
    const [a1, a2, b1, b2, x1, y1] = segment;
    const A = [mid(x, a1), mid(y, a2)];
    const B = [mid(a1, b1), mid(a2, b2)];
    const C = [mid(b1, x1), mid(b2, y1)];
    const D = [mid(A[0], B[0]), mid(A[1], B[1])];
    const E = [mid(B[0], C[0]), mid(B[1], C[1])];
    const F = [mid(D[0], E[0]), mid(D[1], E[1])];
    return [[...A, ...D, ...F], [...E, ...C, x1, y1]];
  }

  function four(points) {
    let x = points[0];
    let y = points[1];
    const output = [x, y];
    for (let i = 2; i < points.length; i += 6) {
      const segment = points.slice(i, i + 6);
      const [first, second] = split(x, y, segment);
      output.push(...first, ...second);
      x = segment[4];
      y = segment[5];
    }
    return output;
  }

  const shiftX = (points, dx) => points.map((value, index) => index % 2 ? value : value + dx);
  const dots = [165, 355, 165, 355, 165, 355, 165, 355];
  const shapes = {
    logo: {
      b: [325, 75, 250, 150, 170, 230, 95, 305, 55, 345, 45, 400, 70, 480],
      g: [445, 285, 385, 345, 300, 420, 255, 465, 195, 525, 215, 620, 300, 655, 360, 675, 410, 650, 450, 610, 490, 570, 520, 530, 550, 490],
      m: dots,
      w: [118, 132, 0],
    },
    T: {
      b: [130, 150, ...L(130, 150, 312, 150), ...L(312, 150, 495, 150)],
      g: [312, 215, ...L(312, 215, 312, 310), ...L(312, 310, 312, 405), ...L(312, 405, 312, 500), ...L(312, 500, 312, 595)],
      m: dots,
      w: [96, 96, 0],
    },
    S: {
      b: shiftX([440, 170, 395, 92, 175, 92, 160, 222, 152, 305, 250, 322, 300, 352], 14),
      g: shiftX(four([300, 352, 385, 385, 465, 418, 450, 508, 432, 610, 200, 622, 140, 545]), 14),
      m: dots,
      w: [88, 88, 0],
    },
    E: {
      b: [140, 150, ...L(140, 150, 305, 150), ...L(305, 150, 470, 150)],
      g: [165, 225, ...L(165, 225, 165, 355), ...L(165, 355, 165, 490), 165, 535, 190, 560, 235, 560, ...L(235, 560, 470, 560)],
      m: [165, 355, ...L(165, 355, 425, 355)],
      w: [92, 92, 92],
    },
  };

  const pathData = (points) => {
    let path = `M${points[0]} ${points[1]}`;
    for (let i = 2; i < points.length; i += 6) path += `C${points.slice(i, i + 6).join(" ")}`;
    return path;
  };
  const lerp = (from, to, amount) => from.map((value, index) => value + (to[index] - value) * amount);
  const ease = (value) => value * value * value * (value * (value * 6 - 15) + 10);
  const clamp = (value) => Math.min(1, Math.max(0, value));
  const get = (id) => stage.querySelector(`#${id}`);
  const letters = [...stage.querySelectorAll(".hero-logo-morph__caption span")];

  function updatePaths(ids, points, width) {
    ids.forEach((id) => {
      get(id).setAttribute("d", pathData(points));
      get(id).setAttribute("stroke-width", Math.max(width, 0));
    });
  }

  function draw(from, to, progress, direction = 1) {
    const blue = ease(clamp(progress * 1.12));
    const green = ease(clamp((progress - 0.1) * 1.12));
    const middle = ease(clamp((progress - 0.2) * 1.25));
    updatePaths(["b", "b2", "b3"], lerp(from.b, to.b, blue), from.w[0] + (to.w[0] - from.w[0]) * blue);
    updatePaths(["g", "g2", "g3"], lerp(from.g, to.g, green), from.w[1] + (to.w[1] - from.w[1]) * green);
    updatePaths(["m", "m2", "m3"], lerp(from.m, to.m, middle), from.w[2] + (to.w[2] - from.w[2]) * middle);
    const pulse = Math.sin(Math.PI * progress);
    get("root").setAttribute("transform", `translate(312 360) rotate(${(direction * 3 * pulse * pulse).toFixed(2)}) scale(${(1 + 0.035 * pulse).toFixed(3)}) translate(-312 -360)`);
  }

  const sequence = ["logo", "T", "S", "E", "logo"];
  const hold = 550;
  const move = 1000;
  const step = hold + move;
  const total = step * 4 + hold;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let elapsed = 0;
  let startedAt = 0;
  let animationFrame = null;
  let inViewport = !("IntersectionObserver" in window);
  let pageVisible = !document.hidden;

  function stop() {
    if (animationFrame === null) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
    elapsed = (elapsed + performance.now() - startedAt) % total;
  }

  function frame(timestamp) {
    animationFrame = null;
    const time = (elapsed + timestamp - startedAt) % total;
    const index = Math.min(Math.floor(time / step), 3);
    const localTime = time - index * step;
    const progress = localTime < hold ? 0 : (localTime - hold) / move;
    draw(shapes[sequence[index]], shapes[sequence[index + 1]], progress, index % 2 ? -1 : 1);
    const activeLetter = progress > 0.45 ? index : index - 1;
    letters.forEach((letter, letterIndex) => letter.classList.toggle("on", letterIndex === activeLetter));
    animationFrame = requestAnimationFrame(frame);
  }

  function syncMotion() {
    const shouldAnimate = !motionPreference.matches && pageVisible && inViewport;
    stage.classList.toggle("is-static", motionPreference.matches);
    if (shouldAnimate && animationFrame === null) {
      startedAt = performance.now();
      animationFrame = requestAnimationFrame(frame);
    } else if (!shouldAnimate) {
      stop();
      if (motionPreference.matches) {
        draw(shapes.logo, shapes.logo, 0);
        letters.forEach((letter) => letter.classList.remove("on"));
      }
    }
  }

  draw(shapes.logo, shapes.logo, 0);
  syncMotion();

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      syncMotion();
    }, { threshold: 0.05 });
    observer.observe(stage);
  }

  document.addEventListener("visibilitychange", () => {
    pageVisible = !document.hidden;
    syncMotion();
  });
  window.addEventListener("pageshow", () => {
    pageVisible = !document.hidden;
    syncMotion();
  });
  window.addEventListener("pagehide", stop);

  if (motionPreference.addEventListener) motionPreference.addEventListener("change", syncMotion);
  else motionPreference.addListener(syncMotion);
});
