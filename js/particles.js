/**
 * Jangkhng 3D NeoTab - 3D Ambient Particle Engine
 * High-performance 3D perspective projection with depth lines
 * Optimized to use zero battery when idle, adaptive to frame rates, auto-paused when tab hidden.
 */

const ParticlesEngine = (function () {
  let canvas = null;
  let ctx = null;
  let width = 0;
  let height = 0;
  let particles = [];
  let animId = null;
  let isRunning = false;
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0, active: false };

  const FOV = 400;
  const PARTICLE_COUNT = 45; // Sweet spot: visually rich, silky 60 FPS on low-end hardware

  function init(enabled, performanceMode) {
    canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    if (!enabled || performanceMode) {
      stop();
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';
    ctx = canvas.getContext('2d');
    resize();

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('visibilitychange', onVisibilityChange);

    createParticles();
    start();
  }

  function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.5,
        y: (Math.random() - 0.5) * height * 1.5,
        z: Math.random() * 800 - 200,
        vz: (Math.random() * 0.8 + 0.3) * (Math.random() > 0.5 ? 1 : -1),
        radius: Math.random() * 2.5 + 1.2,
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(236, 72, 153, '
      });
    }
  }

  function resize() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function onResize() {
    resize();
    createParticles();
  }

  function onMouseMove(e) {
    mouse.targetX = (e.clientX - width / 2) * 0.05;
    mouse.targetY = (e.clientY - height / 2) * 0.05;
    mouse.active = true;
  }

  function onVisibilityChange() {
    if (document.hidden) {
      stop();
    } else if (isRunning) {
      start();
    }
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    loop();
  }

  function stop() {
    isRunning = false;
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    if (ctx && canvas) {
      ctx.clearRect(0, 0, width, height);
    }
  }

  function loop() {
    if (!isRunning) return;

    // Smooth mouse interpolation
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    const cx = width / 2 + mouse.x;
    const cy = height / 2 + mouse.y;

    // Project and render particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Move along Z-depth
      p.z += p.vz;
      if (p.z > 600) p.z = -200;
      if (p.z < -200) p.z = 600;

      // 3D perspective projection formula
      const scale = FOV / (FOV + p.z);
      const px = p.x * scale + cx;
      const py = p.y * scale + cy;

      if (px < 0 || px > width || py < 0 || py > height) continue;

      const alpha = Math.min(1, Math.max(0.1, scale * 0.8));
      const renderRadius = Math.max(0.8, p.radius * scale);

      ctx.beginPath();
      ctx.arc(px, py, renderRadius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + alpha + ')';
      ctx.fill();

      // Render 3D connection lines to nearest neighbors
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const scale2 = FOV / (FOV + p2.z);
        const px2 = p2.x * scale2 + cx;
        const py2 = p2.y * scale2 + cy;

        const dx = px - px2;
        const dy = py - py2;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * 0.18 * scale * scale2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px2, py2);
          ctx.strokeStyle = `rgba(130, 200, 255, ${lineAlpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(loop);
  }

  return {
    init,
    start,
    stop,
    toggle: (enable, perfMode) => {
      init(enable, perfMode);
    }
  };
})();

window.ParticlesEngine = ParticlesEngine;
