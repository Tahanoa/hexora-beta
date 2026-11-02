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

  // Every ember belongs to the logo stage, never the page or the hero copy.
  function ember(initial = false) {
    const life = 230 + Math.random() * 190;
    return {
      age: initial ? Math.random() * life : 0,
      life,
      origin: width * (0.5 + (Math.random() + Math.random() - 1) * 0.34),
      sway: 5 + Math.random() * 15,
      phase: Math.random() * Math.PI * 2,
      radius: 0.5 + Math.random() * 0.85,
      brightness: 0.45 + Math.random() * 0.35
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
    points = Array.from({ length: width < 400 ? 42 : 70 }, () => ember(true));
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
      for (let i = 0; i < points.length; i++) {
        let point = points[i];
        point.age += delta;
        if (point.age >= point.life) point = points[i] = ember();
        const progress = point.age / point.life;
        const x = point.origin + Math.sin(progress * 7 + point.phase) * point.sway;
        const y = height * (0.89 - progress * 0.85);
        const fade = Math.pow(Math.sin(Math.PI * progress), 0.8);
        const opacity = fade * point.brightness * (0.8 + 0.2 * Math.sin(point.age * 0.13 + point.phase));
        const halo = context.createRadialGradient(x, y, 0, x, y, point.radius * 6);
        halo.addColorStop(0, `rgba(101,255,192,${opacity * 0.35})`);
        halo.addColorStop(1, 'rgba(0,194,110,0)');
        context.fillStyle = halo;
        context.fillRect(x - point.radius * 6, y - point.radius * 6, point.radius * 12, point.radius * 12);
        const trail = context.createLinearGradient(x, y, x, y + point.radius * 7);
        trail.addColorStop(0, `rgba(101,255,192,${opacity * 0.7})`);
        trail.addColorStop(1, 'rgba(0,194,110,0)');
        context.strokeStyle = trail;
        context.lineWidth = point.radius * 0.8;
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x, y + point.radius * 7);
        context.stroke();
        context.fillStyle = `rgba(190,255,222,${opacity})`;
        context.beginPath();
        context.arc(x, y, point.radius, 0, Math.PI * 2);
        context.fill();
      }
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
