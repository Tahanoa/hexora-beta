/* Isolated homepage decoration; no API calls or shared application state. */
(() => {
  'use strict';
  const hero = document.querySelector('.hx-hero');
  if (!hero || hero.hidden) return;
  const stage = hero.querySelector('.hx-stage');
  const tilt = hero.querySelector('.hx-tilt');
  const solid = hero.querySelector('.hx-solid');
  const canvas = hero.querySelector('.hx-particles');
  const context = canvas.getContext('2d');
  const toggle = hero.querySelector('.hx-motion');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let motion = !preference.matches;
  let visible = false;
  let frame = 0;
  let lastTime = 0;
  let width = 0;
  let height = 0;
  let points = [];
  let rotation = null;

  function syncLabel() {
    const fa = motion ? 'توقف حرکت‌ها' : 'فعال کردن حرکت‌ها';
    const en = motion ? 'Pause animations' : 'Enable animations';
    const label = toggle.querySelector('span');
    label.dataset.i18nFa = fa;
    label.dataset.i18nEn = en;
    label.textContent = document.documentElement.lang === 'en' ? en : fa;
    toggle.setAttribute('aria-pressed', String(motion));
    hero.dataset.motion = motion ? 'on' : 'off';
  }

  // Short-lived sparks originate along every edge of the logo, not a floor emitter.
  function ember(initial = false) {
    const vertices = [[0,-1],[0.866,-0.5],[0.866,0.5],[0,1],[-0.866,0.5],[-0.866,-0.5]];
    const edge = Math.floor(Math.random() * vertices.length);
    const a = vertices[edge], b = vertices[(edge + 1) % vertices.length];
    const t = Math.random();
    const life = 85 + Math.random() * 100;
    return {
      age: initial ? Math.random() * life : 0,
      life,
      x: width * (0.5 + (a[0] + (b[0] - a[0]) * t) * 0.32) + (Math.random() - 0.5) * 16,
      y: height * (0.4 + (a[1] + (b[1] - a[1]) * t) * 0.33) + (Math.random() - 0.5) * 14,
      vx: (Math.random() - 0.5) * 0.17,
      vy: -0.015 - Math.random() * 0.07,
      sway: 2 + Math.random() * 5,
      frequency: 0.012 + Math.random() * 0.023,
      phase: Math.random() * Math.PI * 2,
      radius: 0.4 + Math.random() * 0.7,
      brightness: 0.3 + Math.random() * 0.4
    };
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = Array.from({ length: width < 400 ? 28 : 44 }, () => ember(true));
  }

  function stop() {
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function start() {
    if (context && motion && visible && !document.hidden && !frame) {
      lastTime = 0;
      frame = requestAnimationFrame(draw);
    }
  }

  function draw(time) {
    frame = 0;
    if (!motion || !visible || document.hidden || !context) return;
    if (!lastTime || time - lastTime >= 30) {
      const delta = lastTime ? Math.min((time - lastTime) / 33, 2) : 1;
      lastTime = time;
      context.clearRect(0, 0, width, height);
      // Keep the effect in a tight envelope around the silhouette, even during drift.
      context.save();
      context.beginPath();
      context.ellipse(width * 0.5, height * 0.4, width * 0.36, height * 0.37, 0, 0, Math.PI * 2);
      context.clip();
      for (let i = 0; i < points.length; i++) {
        let point = points[i];
        point.age += delta;
        if (point.age >= point.life) point = points[i] = ember();
        const progress = point.age / point.life;
        const angle = point.age * point.frequency + point.phase;
        const x = point.x + point.vx * point.age + (Math.sin(angle) - Math.sin(point.phase)) * point.sway;
        const y = point.y + point.vy * point.age + (Math.cos(angle * 0.73) - Math.cos(point.phase * 0.73)) * point.sway * 0.6;
        const fade = Math.sin(Math.PI * progress);
        const opacity = fade * fade * point.brightness;
        const halo = context.createRadialGradient(x, y, 0, x, y, point.radius * 4.5);
        halo.addColorStop(0, `rgba(101,255,192,${opacity * 0.28})`);
        halo.addColorStop(1, 'rgba(0,194,110,0)');
        context.fillStyle = halo;
        context.fillRect(x - point.radius * 5, y - point.radius * 5, point.radius * 10, point.radius * 10);
        context.fillStyle = `rgba(190,255,222,${opacity})`;
        context.beginPath();
        context.ellipse(x, y, point.radius * 0.7, point.radius * (1 + progress * 0.5), point.phase, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }
    frame = requestAnimationFrame(draw);
  }

  function setMotion(enabled) {
    motion = enabled && !preference.matches;
    if (!motion) {
      stop();
      if (rotation) rotation.cancel();
      rotation = null;
      if (context) context.clearRect(0, 0, width, height);
      tilt.style.removeProperty('--rx');
      tilt.style.removeProperty('--ry');
    }
    syncLabel();
    start();
  }

  toggle.addEventListener('click', () => setMotion(!motion));
  preference.addEventListener('change', () => setMotion(!preference.matches));
  new MutationObserver(syncLabel).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  hero.querySelector('.hx-turn').addEventListener('click', () => {
    if (preference.matches) return;
    if (!motion) setMotion(true);
    if (rotation) rotation.cancel();
    const resting = getComputedStyle(solid).transform;
    rotation = solid.animate([
      { transform: resting },
      { transform: 'rotateY(-18deg)' },
      { transform: 'rotateY(18deg)' },
      { transform: resting }
    ], { duration: 2600, easing: 'cubic-bezier(.45,0,.25,1)' });
    rotation.onfinish = () => { rotation = null; };
  });

  if (matchMedia('(pointer: fine)').matches) {
    stage.addEventListener('pointermove', event => {
      if (!motion) return;
      const rect = stage.getBoundingClientRect();
      tilt.style.setProperty('--rx', `${-((event.clientY - rect.top) / rect.height - 0.5) * 10}deg`);
      tilt.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 18}deg`);
    });
    stage.addEventListener('pointerleave', () => {
      tilt.style.setProperty('--rx', '0deg');
      tilt.style.setProperty('--ry', '0deg');
    });
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && !hero.hidden;
    if (visible) start(); else stop();
  }, { threshold: 0 }).observe(stage);
  new ResizeObserver(() => { resize(); start(); }).observe(stage);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      if (rotation) rotation.pause();
    } else {
      start();
      if (motion && rotation) rotation.play();
    }
  });
  resize();
  syncLabel();
})();
