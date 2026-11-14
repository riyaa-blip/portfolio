/* LOADER */
(function () {
  const loader = document.getElementById('loader');
  const fill = document.getElementById('loader-fill');
  const num = document.getElementById('loader-num');
  let p = 0;
  const iv = setInterval(() => {
    p += Math.floor(Math.random() * 7) + 2;
    if (p >= 100) {
      p = 100;
      clearInterval(iv);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.classList.add('ready');
        startTypewriter();
        startCounters(document.querySelectorAll('.hero-speed [data-count]'));
      }, 400);
    }
    fill.style.width = p + '%';
    num.textContent = p;
  }, 60);
})();

/* CUSTOM CURSOR (desktop only) */
const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
const dot = document.querySelector('.cursor-dot');
const ring = document.querySelector('.cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (!isTouch) {
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });
  (function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  })();
  document.querySelectorAll('a, button, .g-item, .tilt, .lang-list span').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
  });
}

/* LIVING BACKGROUND CANVAS */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let W, H, particles = [];
const mouse = { x: null, y: null };
window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });
window.addEventListener('touchmove', e => {
  mouse.x = e.touches[0].clientX;
  mouse.y = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', () => { mouse.x = null; mouse.y = null; });

let lastW = 0;
function resizeCanvas() {
  const newW = window.innerWidth;
  H = canvas.height = window.innerHeight;
  if (newW === lastW && particles.length) return;
  lastW = newW;
  W = canvas.width = newW;
  const small = newW < 700;
  const count = Math.min(small ? 45 : 110, Math.floor((W * H) / (small ? 16000 : 14000)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.8 + 0.4
  }));
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let t = 0;
function drawBackground() {
  ctx.clearRect(0, 0, W, H);
  t += 0.003;

  // flowing magenta aurora ribbons
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 20) {
      const y = H * (0.3 + i * 0.22) +
        Math.sin(x * 0.0035 + t * (1 + i * 0.4) + i) * 90 +
        Math.cos(x * 0.0017 - t * 0.8) * 60;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,31,169,${0.09 - i * 0.02})`;
    ctx.lineWidth = 2 + i;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ff1fa9';
    ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // particles + constellation lines
  particles.forEach((p, i) => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;

    if (mouse.x !== null) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < 140) {
        p.x += (dx / d) * 1.4;
        p.y += (dy / d) * 1.4;
      }
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,106,213,.85)';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ff1fa9';
    ctx.fill();
    ctx.shadowBlur = 0;

    for (let j = i + 1; j < particles.length; j++) {
      const q = particles[j];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 130) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.strokeStyle = `rgba(255,31,169,${0.18 * (1 - d / 130)})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  });

  // mouse glow
  if (mouse.x !== null) {
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
    g.addColorStop(0, 'rgba(255,31,169,.16)');
    g.addColorStop(1, 'rgba(255,31,169,0)');
    ctx.fillStyle = g;
    ctx.fillRect(mouse.x - 220, mouse.y - 220, 440, 440);
  }
  requestAnimationFrame(drawBackground);
}
drawBackground();

/* NAVBAR + SCROLL PROGRESS */
const nav = document.getElementById('nav');
const progressBar = document.getElementById('progress-bar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  const h = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (window.scrollY / h) * 100 + '%';
});

const burger = document.getElementById('burger');
const navLinks = document.getElementById('nav-links');
function toggleMenu(forceClose) {
  const open = forceClose ? false : !navLinks.classList.contains('open');
  navLinks.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}
burger.addEventListener('click', () => toggleMenu());
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(true)));
window.addEventListener('resize', () => { if (window.innerWidth > 1100) toggleMenu(true); });

/* TYPEWRITER */
function startTypewriter() {
  const el = document.getElementById('typewriter');
  const phrases = [
    'Born of rivers. Forged in code.',
    'I paint what the night refuses to say.',
    'Silence is only a loud thing, waiting.',
    'Discipline is my darkest elegance.'
  ];
  let pi = 0, ci = 0, del = false;
  (function type() {
    const word = phrases[pi];
    el.textContent = word.substring(0, del ? ci-- : ci++);
    let speed = del ? 35 : 75;
    if (!del && ci > word.length) { del = true; speed = 1800; }
    else if (del && ci < 0) { del = false; pi = (pi + 1) % phrases.length; ci = 0; speed = 400; }
    setTimeout(type, speed);
  })();
}

/* REVEAL ON SCROLL + COUNTERS */
function startCounters(nodes) {
  nodes.forEach(el => {
    if (el.dataset.done) return;
    el.dataset.done = 'true';
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || 0);
    const dur = 2200;
    const start = performance.now();
    (function tick(now) {
      const prog = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - prog, 4);
      el.textContent = (target * eased).toFixed(dec);
      if (prog < 1) requestAnimationFrame(tick);
    })(start);
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      startCounters(entry.target.querySelectorAll('[data-count]'));
      if (entry.target.querySelector('#terminal-text') || entry.target.classList.contains('terminal')) runTerminal();
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* 3D TILT + SPOTLIGHT */
if (!isTouch) document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    const rotY = ((x / r.width) - 0.5) * 12;
    const rotX = ((y / r.height) - 0.5) * -12;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* TERMINAL TYPING */
let terminalStarted = false;
function runTerminal() {
  if (terminalStarted) return;
  terminalStarted = true;
  const out = document.getElementById('terminal-text');
  const lines = [
    '$ whoami',
    '> riya_nath // cse // iiit_raichur',
    '$ cat passions.txt',
    '> painting | photography | coding',
    '$ cat arena.txt',
    '> badminton | rubiks_cube | taekwondo',
    '$ run ambition.exe',
    '> compiling destiny... done.',
    '> status: UNSTOPPABLE_'
  ];
  let li = 0, ci = 0;
  (function typeLine() {
    if (li >= lines.length) return;
    const line = lines[li];
    out.textContent += line[ci++] || '';
    if (ci >= line.length) {
      out.textContent += '\n';
      li++; ci = 0;
      setTimeout(typeLine, 380);
    } else {
      setTimeout(typeLine, 28);
    }
  })();
}

/* LIGHTBOX */
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lb-img');
const lbCap = document.getElementById('lb-caption');
document.querySelectorAll('.g-item').forEach(item => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    if (!img || img.style.display === 'none') return;
    lbImg.src = img.src;
    lbCap.textContent = item.dataset.title;
    lightbox.classList.add('open');
  });
});
function closeLightbox() { lightbox.classList.remove('open'); }
document.getElementById('lb-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

/* FOOTER YEAR */
document.getElementById('year').textContent = new Date().getFullYear();