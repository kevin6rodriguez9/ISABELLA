/* ═══════════════════════════════════════════
   SCRIPT.JS — Isabella Cinematic Experience
   Fully modular, no external dependencies
═══════════════════════════════════════════ */

'use strict';

// ─── UTILS ──────────────────────────────────
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const rand = (a, b) => Math.random() * (b - a) + a;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

// ─── MOUSE ──────────────────────────────────
const Mouse = (() => {
  let x = 0, y = 0;
  document.addEventListener('mousemove', e => { x = e.clientX; y = e.clientY; });
  return { get x() { return x; }, get y() { return y; } };
})();

/* ═══════════════════════════════════════════
   MODULE: CURSOR
═══════════════════════════════════════════ */
const Cursor = {
  el: null, cx: 0, cy: 0,
  init() {
    this.el = $('#cursor');
    if (!this.el || window.matchMedia('(hover:none)').matches) {
      if (this.el) this.el.style.display = 'none';
      document.body.style.cursor = 'auto';
      return;
    }
    this.tick();
    // Hover states
    document.addEventListener('mouseover', e => {
      if (e.target.matches('button,a,[role="button"]'))
        document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.matches('button,a,[role="button"]'))
        document.body.classList.remove('cursor-hover');
    });
  },
  tick() {
    this.cx = lerp(this.cx, Mouse.x, 0.14);
    this.cy = lerp(this.cy, Mouse.y, 0.14);
    this.el.style.left = this.cx + 'px';
    this.el.style.top = this.cy + 'px';
    requestAnimationFrame(() => this.tick());
  }
};

/* ═══════════════════════════════════════════
   MODULE: GLOBAL PARTICLE CANVAS
   Ambient floating dust particles
═══════════════════════════════════════════ */
const GlobalParticles = {
  canvas: null, ctx: null, W: 0, H: 0,
  particles: [],
  init() {
    this.canvas = $('#globalCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.spawn();
    this.tick();
  },
  resize() {
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  },
  spawn() {
    this.particles = Array.from({ length: 60 }, () => this.newParticle(true));
  },
  newParticle(random = false) {
    return {
      x: rand(0, this.W),
      y: random ? rand(0, this.H) : this.H + 10,
      r: rand(.3, 1.8),
      vx: rand(-.15, .15),
      vy: rand(-.4, -.1),
      alpha: 0,
      maxAlpha: rand(.08, .35),
      life: 0,
      maxLife: rand(180, 420),
      hue: rand(330, 360)
    };
  },
  tick() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this.particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const t = p.life / p.maxLife;
      p.alpha = Math.sin(t * Math.PI) * p.maxAlpha;
      if (p.life >= p.maxLife) this.particles[i] = this.newParticle();

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = `hsl(${p.hue},80%,75%)`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(() => this.tick());
  }
};

/* ═══════════════════════════════════════════
   MODULE: LOADER
   Film-style loading with progressive captions
═══════════════════════════════════════════ */
const Loader = {
  el: null, bar: null, caption: null,
  captions: [
    'Preparando recuerdos…',
    'Cargando sentimientos…',
    'Ajustando el corazón…',
    'Casi listo…',
    '💘'
  ],
  canvas: null, ctx: null, W: 0, H: 0, particles: [],
  done: false,

  init(onComplete) {
    this.el = $('#loader');
    this.bar = $('#loaderBar');
    this.caption = $('#loaderCaption');
    this.canvas = $('#loaderCanvas');
    if (!this.el) { onComplete && onComplete(); return; }

    this.ctx = this.canvas.getContext('2d');
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
    this.spawnLoaderParticles();
    this.tickCanvas();

    document.body.classList.add('locked');
    let progress = 0;
    let captionIdx = 0;

    // Animate bar progress
    const step = () => {
      if (this.done) return;
      const add = rand(.8, 2.2);
      progress = Math.min(progress + add, 100);
      this.bar.style.width = progress + '%';

      // Update caption at milestones
      const capAt = [20, 40, 62, 82, 98];
      if (captionIdx < capAt.length && progress >= capAt[captionIdx]) {
        this.caption.style.opacity = '0';
        setTimeout(() => {
          this.caption.textContent = this.captions[captionIdx];
          this.caption.style.opacity = '1';
        }, 200);
        captionIdx++;
      }

      if (progress < 100) {
        setTimeout(step, rand(25, 60));
      } else {
        this.done = true;
        setTimeout(() => this.finish(onComplete), 700);
      }
    };
    this.caption.style.transition = 'opacity .3s';
    setTimeout(step, 400);
  },

  spawnLoaderParticles() {
    this.particles = Array.from({ length: 30 }, () => ({
      x: rand(0, this.W), y: rand(0, this.H),
      vx: rand(-.2, .2), vy: rand(-.3, .05),
      r: rand(.5, 2), alpha: rand(.05, .2),
      life: 0, maxLife: rand(150, 350)
    }));
  },

  tickCanvas() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this.particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const t = p.life / p.maxLife;
      const a = Math.sin(t * Math.PI) * p.alpha;
      if (p.life >= p.maxLife) {
        this.particles[i] = { x: rand(0, W), y: H + 5, vx: rand(-.2, .2), vy: rand(-.3, -.08), r: rand(.5, 2), alpha: rand(.05, .2), life: 0, maxLife: rand(150, 350) };
      }
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = `hsl(${rand(330, 360)},70%,70%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    if (!this.done) requestAnimationFrame(() => this.tickCanvas());
  },

  finish(cb) {
    this.el.classList.add('out');
    setTimeout(() => {
      this.el.style.display = 'none';
      document.body.classList.remove('locked');
      cb && cb();
    }, 1200);
  }
};

/* ═══════════════════════════════════════════
   MODULE: ENTRY CANVAS (star field)
═══════════════════════════════════════════ */
const EntryCanvas = {
  canvas: null, ctx: null, W: 0, H: 0,
  stars: [], conns: [], mouse: { x: 0, y: 0 },
  init() {
    this.canvas = $('#entryCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.buildStars();
    this.tick();
    window.addEventListener('resize', () => { this.resize(); this.buildStars(); });
    this.canvas.addEventListener('mousemove', e => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top;
    });
  },
  resize() {
    this.W = this.canvas.width = window.innerWidth;
    this.H = this.canvas.height = window.innerHeight;
  },
  buildStars() {
    const n = Math.floor((this.W * this.H) / 18000);
    this.stars = Array.from({ length: n }, () => ({
      x: rand(0, this.W), y: rand(0, this.H),
      vx: rand(-.06, .06), vy: rand(-.06, .06),
      r: rand(.3, 1.5), alpha: rand(.1, .6),
      pulse: rand(0, Math.PI * 2), pSpeed: rand(.005, .02)
    }));
  },
  tick() {
    const { ctx, W, H, stars, mouse } = this;
    ctx.clearRect(0, 0, W, H);
    const maxDist = 120;

    stars.forEach((s, i) => {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      s.pulse += s.pSpeed;
      const a = s.alpha * (0.6 + 0.4 * Math.sin(s.pulse));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = `hsl(${rand(330, 360)},80%,75%)`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Connect nearby stars
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[j].x - s.x, dy = stars[j].y - s.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          ctx.save();
          ctx.globalAlpha = (1 - d / maxDist) * 0.08;
          ctx.strokeStyle = '#ff6b9d';
          ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(stars[j].x, stars[j].y);
          ctx.stroke(); ctx.restore();
        }
      }
      // Mouse proximity glow
      const mdx = mouse.x - s.x, mdy = mouse.y - s.y;
      const md = Math.sqrt(mdx * mdx + mdy * mdy);
      if (md < 100) {
        ctx.save();
        ctx.globalAlpha = (1 - md / 100) * 0.6;
        ctx.strokeStyle = 'rgba(214,48,104,0.5)';
        ctx.lineWidth = .5;
        ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke(); ctx.restore();
        s.vx += (s.x - mouse.x) * 0.00005;
        s.vy += (s.y - mouse.y) * 0.00005;
      }
    });
    requestAnimationFrame(() => this.tick());
  }
};

/* ═══════════════════════════════════════════
   MODULE: HERO PARTICLES
═══════════════════════════════════════════ */
const HeroParticles = {
  canvas: null, ctx: null, W: 0, H: 0, pts: [],
  init() {
    this.canvas = $('#heroParticles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.pts = Array.from({ length: 50 }, () => this.newPt(true));
    this.tick();
    window.addEventListener('resize', () => this.resize());
  },
  resize() { this.W = this.canvas.width = this.canvas.parentElement.offsetWidth || window.innerWidth; this.H = this.canvas.height = this.canvas.parentElement.offsetHeight || window.innerHeight; },
  newPt(rand_pos = false) {
    return { x: rand(0, this.W), y: rand_pos ? rand(0, this.H) : this.H + 10, vy: rand(-.3, -.1), vx: rand(-.1, .1), r: rand(.4, 2), life: 0, maxLife: rand(200, 500), alpha: rand(.1, .4) };
  },
  tick() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);
    this.pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const t = p.life / p.maxLife;
      const a = Math.sin(t * Math.PI) * p.alpha;
      if (p.life >= p.maxLife) this.pts[i] = this.newPt();
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = `hsl(${rand(330, 355)},70%,75%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(() => this.tick());
  }
};

/* ═══════════════════════════════════════════
   MODULE: ENTRY SCREEN
═══════════════════════════════════════════ */
const Entry = {
  el: null, btn: null,
  init(onStart) {
    this.el = $('#entryScreen');
    this.btn = $('#entryCta');
    if (!this.el) { onStart && onStart(); return; }

    EntryCanvas.init();

    // Show entry
    this.el.classList.add('show');

    this.btn.addEventListener('click', () => {
      this.el.classList.add('hide');
      setTimeout(() => {
        this.el.style.display = 'none';
        onStart && onStart();
      }, 1400);
    });
  }
};

/* ═══════════════════════════════════════════
   MODULE: CHAPTER OVERLAY
   Cinematic between-chapter title cards
═══════════════════════════════════════════ */
const ChapterOverlay = {
  el: null, numEl: null, titleEl: null,
  init() {
    this.el = $('#chapterOverlay');
    this.numEl = $('#chapterNum');
    this.titleEl = $('#chapterTitleText');
  },
  show(num, title, cb) {
    if (!this.el) { cb && cb(); return; }
    this.numEl.textContent = num;
    this.titleEl.textContent = title;
    this.el.classList.add('active');
    setTimeout(() => {
      this.el.classList.remove('active');
      cb && cb();
    }, 2000);
  }
};

/* ═══════════════════════════════════════════
   MODULE: SCROLL REVEAL
   IntersectionObserver based reveals with stagger
═══════════════════════════════════════════ */
const Reveal = {
  triggered: new Set(),
  init() {
    // Scene titles
    const titleObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          titleObs.unobserve(e.target);
        }
      });
    }, { threshold: .15 });
    $$('.scene-title, .scene-intro').forEach(el => titleObs.observe(el));

    // Cards with stagger
    const gridObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.triggered.has(e.target)) {
          this.triggered.add(e.target);
          $$('.cine-card', e.target).forEach((c, i) => {
            setTimeout(() => c.classList.add('visible'), parseInt(c.dataset.delay) || i * 80);
          });
          gridObs.unobserve(e.target);
        }
      });
    }, { threshold: .08 });
    $$('.cards-grid').forEach(el => gridObs.observe(el));

    // Memory items
    const memObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.triggered.has(e.target)) {
          this.triggered.add(e.target);
          $$('.mem-item').forEach((m, i) => {
            setTimeout(() => m.classList.add('visible'), i * 150);
          });
        }
      });
    }, { threshold: .08 });
    $$('.memories-timeline').forEach(el => memObs.observe(el));

    // Poem lines stagger
    const poemObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.triggered.has(e.target)) {
          this.triggered.add(e.target);
          $$('.poem-line', e.target).forEach((l, i) => {
            setTimeout(() => l.classList.add('visible'), i * 110);
          });
        }
      });
    }, { threshold: .1 });
    $$('.poem-lines').forEach(el => poemObs.observe(el));

    // Interludes
    const interObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); interObs.unobserve(e.target); }
      });
    }, { threshold: .3 });
    $$('.interlude').forEach(el => interObs.observe(el));

    // Final section
    const finalObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !this.triggered.has(e.target)) {
          this.triggered.add(e.target);
          FinalScene.trigger();
        }
      });
    }, { threshold: .3 });
    const finalScene = $('#sceneFinal');
    if (finalScene) finalObs.observe(finalScene);
  }
};

/* ═══════════════════════════════════════════
   MODULE: FINAL SCENE
   Emotional finale with canvas, burst, reveals
═══════════════════════════════════════════ */
const FinalScene = {
  canvas: null, ctx: null, W: 0, H: 0,
  particles: [], rings: [], confetti: [],
  running: false,

  init() {
    this.canvas = $('#finalCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
  },

  resize() {
    this.W = this.canvas.width = this.canvas.parentElement.offsetWidth || window.innerWidth;
    this.H = this.canvas.height = this.canvas.parentElement.offsetHeight || window.innerHeight;
  },

  trigger() {
    if (this.running) return;
    this.running = true;

    // Reveal text elements sequentially
    const seq = ['.final-act', '.final-title', '.final-message-wrap', '.firma-wrap'];
    seq.forEach((sel, i) => {
      setTimeout(() => { const el = $(sel); if (el) el.classList.add('visible'); }, i * 400 + 300);
    });

    // Start canvas effects
    this.spawnInitialParticles();
    this.spawnRings();
    this.tick();

    // Big burst after delay
    setTimeout(() => this.burstHearts(), 1500);
    setTimeout(() => this.burstConfetti(), 1600);
  },

  spawnInitialParticles() {
    this.particles = Array.from({ length: 80 }, () => ({
      x: rand(0, this.W), y: rand(0, this.H),
      vx: rand(-.25, .25), vy: rand(-.4, -.1),
      r: rand(.4, 2.5), life: 0, maxLife: rand(200, 600),
      alpha: rand(.1, .5), hue: rand(330, 360)
    }));
  },

  spawnRings() {
    const cx = this.W / 2, cy = this.H / 2;
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.rings.push({
          x: cx, y: cy, r: 10, maxR: Math.max(this.W, this.H) * 0.6,
          alpha: 0.3, life: 0, maxLife: 120
        });
      }, i * 400);
    }
  },

  burstHearts() {
    const container = $('#heartsBurst');
    if (!container) return;
    const symbols = ['💘', '💗', '♡', '✿', '✦', '✧', '❀', '💖'];
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    for (let i = 0; i < 50; i++) {
      const el = document.createElement('span');
      el.className = 'burst-heart';
      el.textContent = symbols[Math.floor(rand(0, symbols.length))];
      const angle = rand(0, Math.PI * 2);
      const dist = rand(80, Math.min(cx, cy) * 1.2);
      const tx = Math.cos(angle) * dist, ty = Math.sin(angle) * dist;
      const dur = rand(1, 2.2), delay = rand(0, .5);
      const rot = rand(-45, 45), rot2 = rand(-90, 90);
      el.style.cssText = `
        left:${cx}px;top:${cy}px;
        font-size:${rand(.8, 2.5)}rem;
        --tx:${tx}px;--ty:${ty}px;
        --dur:${dur}s;--delay:${delay}s;
        --rot:${rot}deg;--rot2:${rot2}deg;
        animation-duration:${dur}s;
        animation-delay:${delay}s;
      `;
      container.appendChild(el);
      setTimeout(() => el.remove(), (dur + delay + .5) * 1000);
    }
  },

  burstConfetti() {
    this.confetti = Array.from({ length: 60 }, () => {
      const angle = rand(0, Math.PI * 2), speed = rand(2, 8);
      return {
        x: this.W / 2, y: this.H / 2,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - rand(2, 5),
        r: rand(2, 5), hue: rand(330, 360),
        life: 0, maxLife: rand(60, 150), alpha: 1,
        spin: rand(0, Math.PI * 2), spinV: rand(-.2, .2)
      };
    });
  },

  tick() {
    const { ctx, W, H } = this;
    ctx.clearRect(0, 0, W, H);

    // Ambient glow
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.5);
    grd.addColorStop(0, 'rgba(214,48,104,0.06)');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);

    // Rings
    this.rings = this.rings.filter(ring => {
      ring.r = lerp(ring.r, ring.maxR, 0.03); ring.life++;
      ring.alpha = clamp((1 - ring.life / ring.maxLife) * 0.4, 0, 1);
      if (ring.alpha <= 0) return false;
      ctx.save(); ctx.globalAlpha = ring.alpha;
      ctx.strokeStyle = 'rgba(214,48,104,0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
      ctx.stroke(); ctx.restore();
      return ring.life < ring.maxLife;
    });

    // Dust particles
    this.particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.life++;
      const t = p.life / p.maxLife;
      const a = Math.sin(t * Math.PI) * p.alpha;
      if (p.life >= p.maxLife) {
        this.particles[i] = { x: rand(0, W), y: H + 10, vx: rand(-.25, .25), vy: rand(-.4, -.1), r: rand(.4, 2.5), life: 0, maxLife: rand(200, 600), alpha: rand(.1, .5), hue: rand(330, 360) };
      }
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = `hsl(${p.hue},75%,72%)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });

    // Confetti
    this.confetti = this.confetti.filter(c => {
      c.x += c.vx; c.y += c.vy; c.vy += 0.12; c.spin += c.spinV; c.life++;
      c.alpha = clamp(1 - c.life / c.maxLife, 0, 1);
      if (c.alpha <= 0) return false;
      ctx.save(); ctx.globalAlpha = c.alpha;
      ctx.translate(c.x, c.y); ctx.rotate(c.spin);
      ctx.fillStyle = `hsl(${c.hue},80%,70%)`;
      ctx.fillRect(-c.r / 2, -c.r / 2, c.r, c.r);
      ctx.restore();
      return c.life < c.maxLife;
    });

    requestAnimationFrame(() => this.tick());
  }
};

/* ═══════════════════════════════════════════
   MODULE: CARD MOUSE GLOW
═══════════════════════════════════════════ */
const CardGlow = {
  init() {
    $$('.cine-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        const glow = card.querySelector('.cine-card-glow');
        if (glow) glow.style.background = `radial-gradient(circle at ${mx}% ${my}%, rgba(214,48,104,0.18), transparent 55%)`;
      });
    });
  }
};

/* ═══════════════════════════════════════════
   MODULE: MUSIC BUTTON
═══════════════════════════════════════════ */
const Music = {
  btn: null, audio: null, icon: null, playing: false,
  init() {
    this.btn = $('#musicBtn');
    this.audio = $('#bgAudio');
    this.icon = $('#musicIcon');
    if (!this.btn) return;
    this.btn.addEventListener('click', () => {
      this.playing = !this.playing;
      this.icon.textContent = this.playing ? '♫' : '♪';
      this.btn.classList.toggle('playing', this.playing);
      if (this.audio && this.audio.src && this.audio.src !== window.location.href) {
        this.playing ? this.audio.play().catch(() => { }) : this.audio.pause();
      }
    });
  }
};

/* ═══════════════════════════════════════════
   MODULE: BACK TO TOP
═══════════════════════════════════════════ */
const BackTop = {
  init() {
    const btn = $('#backTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('show', window.scrollY > 500);
    }, { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
};

/* ═══════════════════════════════════════════
   MODULE: PARALLAX ORBS (scroll-based)
   Gentle movement of ambient light blobs
═══════════════════════════════════════════ */
const Parallax = {
  init() {
    const ambients = $$('.scene-ambient');
    window.addEventListener('scroll', () => {
      const sy = window.scrollY;
      ambients.forEach((a, i) => {
        const speed = 0.04 + i * 0.01;
        const el = a.querySelector(':after');
        a.style.transform = `translateY(${sy * speed}px)`;
      });
    }, { passive: true });
  }
};

/* ═══════════════════════════════════════════
   MODULE: CHAPTER TRIGGERS
   Detect when scrolling into a new chapter
═══════════════════════════════════════════ */
const Chapters = {
  shown: new Set(),
  chapters: [
    { id: 'sceneQualities', num: 'Capítulo I', title: 'Lo que me gusta de ti' },
    { id: 'sceneMemories', num: 'Capítulo II', title: 'Nuestros recuerdos' },
    { id: 'scenePoem', num: 'Capítulo III', title: 'Lo que eres para mí' },
    { id: 'sceneFinal', num: 'Fin', title: 'Para siempre' },
  ],
  init() {
    this.chapters.forEach(ch => {
      const el = $('#' + ch.id);
      if (!el) return;
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting && !this.shown.has(ch.id)) {
            this.shown.add(ch.id);
            obs.unobserve(el);
            // Small delay so user has scrolled into view
            setTimeout(() => {
              ChapterOverlay.show(ch.num, ch.title);
            }, 200);
          }
        });
      }, { threshold: .35 });
      obs.observe(el);
    });
  }
};

/* ═══════════════════════════════════════════
   BOOT SEQUENCE
═══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  // 1. Cursor always on
  Cursor.init();

  // 2. Global ambient particles (behind everything)
  GlobalParticles.init();

  // 3. Final scene canvas pre-init (just sets up canvas size)
  FinalScene.init();

  // 4. Chapter overlay ready
  ChapterOverlay.init();

  // 5. FABs init (hidden until main shows)
  Music.init();
  BackTop.init();

  // 6. LOADER → ENTRY → MAIN
  Loader.init(() => {

    // After loader: show entry screen
    Entry.init(() => {

      // After entry: reveal main content
      const main = $('#main');
      if (main) { main.classList.add('show'); main.removeAttribute('aria-hidden'); }

      // Show FABs
      setTimeout(() => {
        $$('.fab').forEach(f => f.classList.add('show'));
      }, 600);

      // Start hero particles
      HeroParticles.init();

      // Init scroll reveals
      Reveal.init();

      // Init chapter triggers
      Chapters.init();

      // Init card glow
      CardGlow.init();

      // Parallax
      Parallax.init();

    });
  });
});