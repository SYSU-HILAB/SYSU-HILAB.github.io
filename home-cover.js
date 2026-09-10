(() => {
  const cover = document.querySelector('.teachers-cover');
  if (!cover) return;

  const stage = cover.querySelector('.teachers-cover__stage');
  const content = document.getElementById('home-content');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);
  let frame = 0;
  let stageHeight = stage.clientHeight;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  cover.classList.add('is-enhanced');

  function render() {
    frame = 0;
    const progress = reducedMotion.matches ? 0 : clamp(-cover.getBoundingClientRect().top / stageHeight);
    const fade = smoothstep(clamp((progress - .08) / .85));
    if (reducedMotion.matches || progress >= .9) {
      targetX = targetY = pointerX = pointerY = 0;
    }
    pointerX += (targetX - pointerX) * .09;
    pointerY += (targetY - pointerY) * .09;
    cover.style.setProperty('--cover-progress', progress.toFixed(4));
    cover.style.setProperty('--cover-opacity', (1 - fade).toFixed(4));
    cover.style.setProperty('--copy-opacity', (1 - smoothstep(clamp(progress / .6))).toFixed(4));
    cover.style.setProperty('--wash-opacity', (1 - smoothstep(clamp(progress / .8))).toFixed(4));
    cover.style.setProperty('--pointer-x', pointerX.toFixed(4));
    cover.style.setProperty('--pointer-y', pointerY.toFixed(4));
    if (Math.abs(targetX - pointerX) + Math.abs(targetY - pointerY) > .001) requestRender();
  }

  function requestRender() {
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  function resize() {
    stageHeight = stage.clientHeight;
    requestRender();
  }

  // Native scrolling stays in charge; only the cover's visual properties change.
  window.addEventListener('scroll', requestRender, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  reducedMotion.addEventListener('change', resize);

  // A small, eased parallax adds depth on a mouse; touch keeps native scrolling.
  stage.addEventListener('pointermove', (event) => {
    if (reducedMotion.matches || !finePointer.matches || event.pointerType !== 'mouse') return;
    const bounds = stage.getBoundingClientRect();
    targetX = clamp((event.clientX - bounds.left) / bounds.width) - .5;
    targetY = clamp((event.clientY - bounds.top) / bounds.height) - .5;
    requestRender();
  }, { passive: true });
  stage.addEventListener('pointerleave', () => {
    targetX = targetY = 0;
    requestRender();
  });

  cover.querySelectorAll('a[href="#home-content"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      content.focus({ preventScroll: true });
      content.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'start' });
    });
  });

  render();
})();
