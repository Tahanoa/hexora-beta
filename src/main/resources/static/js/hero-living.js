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
  const pointer = { x: -1000, y: -1000 };

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

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    if (context) context.setTransform(ratio, 0, 0, ratio, 0, 0);
    points = Array.from({ length: width < 621 ? 22 : 46 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.17,
      radius: Math.random() * 0.8 + 0.4
    }));
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
      for (const point of points) {
        point.x += point.vx * delta;
        point.y += point.vy * delta;
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
        const proximity = Math.max(0, 1 - Math.hypot(point.x - pointer.x, point.y - pointer.y) / 160);
        context.fillStyle = `rgba(101,255,192,${0.25 + proximity * 0.4})`;
        context.beginPath();
        context.arc(point.x, point.y, point.radius + proximity * 0.7, 0, Math.PI * 2);
        context.fill();
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i];
          const b = points[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < 105) {
            context.strokeStyle = `rgba(0,194,110,${0.09 * (1 - distance / 105)})`;
            context.lineWidth = 0.5;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
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
    rotation = solid.animate([
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(180deg)' },
      { transform: 'rotateY(360deg)' }
    ], { duration: 2300, easing: 'cubic-bezier(.45,0,.25,1)' });
    rotation.onfinish = () => { rotation = null; };
  });

  if (matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', event => {
      if (!motion) return;
      const rect = hero.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    });
    hero.addEventListener('pointerleave', () => { pointer.x = pointer.y = -1000; });
    stage.addEventListener('pointermove', event => {
      if (!motion) return;
      const rect = stage.getBoundingClientRect();
      tilt.style.setProperty('--rx', `${-((event.clientY - rect.top) / rect.height - 0.5) * 22}deg`);
      tilt.style.setProperty('--ry', `${((event.clientX - rect.left) / rect.width - 0.5) * 34}deg`);
    });
    stage.addEventListener('pointerleave', () => {
      tilt.style.setProperty('--rx', '0deg');
      tilt.style.setProperty('--ry', '0deg');
    });
  }

  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && !hero.hidden;
    if (visible) start(); else stop();
  }, { threshold: 0 }).observe(hero);
  new ResizeObserver(() => { resize(); start(); }).observe(hero);
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
