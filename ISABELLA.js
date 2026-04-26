/* =============================================
   SCRIPT.JS — Isabella Love Story Experience
   Modular, clean, production-grade
============================================= */

// ─── UTILS ──────────────────────────────────
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rand = (min, max) => Math.random() * (max - min) + min;
const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

// ─── CURSOR ─────────────────────────────────
const initCursor = () => {
  const cursor = qs("#cursor");
  const cursorTrail = qs("#cursorTrail");
  if (!cursor || !cursorTrail) return;

  let mx = 0,
    my = 0;
  let tx = 0,
    ty = 0;
  let trailX = 0,
    trailY = 0;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  const animCursor = () => {
    // Cursor snaps instantly
    cursor.style.left = mx + "px";
    cursor.style.top = my + "px";

    // Trail lerps
    trailX += (mx - trailX) * 0.12;
    trailY += (my - trailY) * 0.12;
    cursorTrail.style.left = trailX + "px";
    cursorTrail.style.top = trailY + "px";

    requestAnimationFrame(animCursor);
  };
  animCursor();

  // Hide on mobile
  if (window.matchMedia("(hover: none)").matches) {
    cursor.style.display = "none";
    cursorTrail.style.display = "none";
    document.body.style.cursor = "auto";
  }
};

// ─── CANVAS BACKGROUND ─────────────────────
const initCanvas = () => {
  const canvas = qs("#bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W,
    H,
    particles = [];

  const resize = () => {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  };

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = rand(0, W);
      this.y = rand(0, H);
      this.r = rand(0.5, 2.5);
      this.vx = rand(-0.2, 0.2);
      this.vy = rand(-0.3, -0.08);
      this.alpha = rand(0.1, 0.5);
      this.life = 0;
      this.maxLife = rand(200, 500);
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      const t = this.life / this.maxLife;
      this.alpha = Math.sin(t * Math.PI) * 0.5;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = `hsl(${rand(330, 360)}, 80%, 70%)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  const initParticles = () => {
    particles = Array.from({ length: 80 }, () => new Particle());
  };

  const loop = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach((p) => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(loop);
  };

  window.addEventListener("resize", () => {
    resize();
  });
  resize();
  initParticles();
  loop();
};

// ─── ENTRY SCREEN ───────────────────────────
const initEntry = () => {
  const screen = qs("#entryScreen");
  const btn = qs("#entryBtn");
  const main = qs("#main");
  const musicBtn = qs("#musicBtn");
  const particles = qs("#entryParticles");
  if (!screen || !btn) return;

  document.body.classList.add("locked");

  // Spawn mini hearts on entry
  const spawnEntryParticle = () => {
    const el = document.createElement("span");
    el.textContent = ["✦", "✧", "♡", "✿", "·"][Math.floor(rand(0, 5))];
    el.style.cssText = `
      position: absolute;
      left:  ${rand(5, 95)}%;
      top:   ${rand(5, 95)}%;
      font-size: ${rand(0.6, 1.4)}rem;
      color: rgba(255,${Math.floor(rand(100, 180))},${Math.floor(rand(150, 220))}, ${rand(0.15, 0.4)});
      pointer-events: none;
      animation: floatStar ${rand(4, 8)}s ease-in-out infinite;
      animation-delay: ${rand(0, 4)}s;
    `;
    particles && particles.appendChild(el);
  };

  // inject keyframe for entry particles
  const styleTag = document.createElement("style");
  styleTag.textContent = `
    @keyframes floatStar {
      0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
      50%       { transform: translateY(-20px) rotate(10deg); opacity: 0.7; }
    }
  `;
  document.head.appendChild(styleTag);

  for (let i = 0; i < 40; i++) spawnEntryParticle();

  const startExperience = () => {
    screen.classList.add("hiding");
    document.body.classList.remove("locked");

    setTimeout(() => {
      screen.classList.add("hidden");
      main.classList.add("visible");
      musicBtn.classList.add("visible");

      // Trigger hero name animation
      const heroName = qs("#heroName");
      const heroLine = qs(".hero-line");
      if (heroName) heroName.classList.add("animated");
      if (heroLine) heroLine.classList.add("animated");
    }, 1200);
  };

  btn.addEventListener("click", startExperience);

  // Also allow pressing Enter/Space
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") startExperience();
  });
};

// ─── FLOATING HEARTS ────────────────────────
const initHearts = () => {
  const container = qs("#hearts");
  if (!container) return;

  const symbols = ["💘", "💗", "♡", "✦", "✿", "❀", "✧"];

  const create = () => {
    const el = document.createElement("span");
    el.classList.add("heart");
    el.textContent = symbols[Math.floor(rand(0, symbols.length))];
    el.style.left = rand(0, 100) + "vw";
    el.style.fontSize = rand(0.7, 2) + "rem";
    const dur = rand(7, 14);
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = rand(0, 2) + "s";
    container.appendChild(el);
    setTimeout(() => el.remove(), (dur + 2) * 1000);
  };

  setInterval(create, 800);
};

// ─── INTERSECTION OBSERVER (staggered) ──────
const initScrollReveal = () => {
  // Section cards
  const sectionInners = qsa(".section-inner");
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          cardObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
  );

  sectionInners.forEach((el) => cardObserver.observe(el));

  // Quality cards stagger
  const qualityCards = qsa(".quality-card");
  const qualObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const cards = qsa(".quality-card");
          cards.forEach((c, i) => {
            setTimeout(() => c.classList.add("visible"), i * 80);
          });
          qualObs.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );

  const qualGrid = qs(".qualities");
  if (qualGrid) qualObs.observe(qualGrid);

  // Memories stagger
  const memories = qsa(".memory");
  const memObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          memories.forEach((m, i) => {
            setTimeout(() => m.classList.add("visible"), i * 120);
          });
          memObs.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );

  const memGrid = qs(".memories");
  if (memGrid) memObs.observe(memGrid);

  // About lines stagger
  const aboutLines = qsa(".about-line");
  const aboutObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          aboutLines.forEach((l, i) => {
            setTimeout(() => l.classList.add("visible"), i * 100);
          });
          aboutObs.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );

  const aboutYou = qs(".about-you");
  if (aboutYou) aboutObs.observe(aboutYou);

  // Firma reveal
  const firma = qs(".firma");
  if (firma) {
    const firmaObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => firma.classList.add("visible"), 600);
            firmaObs.disconnect();
          }
        });
      },
      { threshold: 0.5 },
    );
    firmaObs.observe(firma);
  }
};

// ─── FINAL SECTION BURST ─────────────────────
const initFinalBurst = () => {
  const finalSection = qs("#secFinal");
  const burst = qs("#finalBurst");
  if (!finalSection || !burst) return;

  let triggered = false;

  const fireParticles = () => {
    if (triggered) return;
    triggered = true;

    const colors = [
      "#e8306a",
      "#ff6b9d",
      "#ffb3d0",
      "#fff",
      "#ffd6e7",
      "#c01555",
    ];
    const shapes = ["💘", "✦", "✧", "♡", "✿"];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 60; i++) {
      const el = document.createElement("span");
      el.classList.add("final-burst-particle");

      const angle = rand(0, Math.PI * 2);
      const dist = rand(
        100,
        Math.min(window.innerWidth, window.innerHeight) * 0.6,
      );
      const tx = Math.cos(angle) * dist;
      const ty = Math.sin(angle) * dist;
      const size = rand(0.8, 2.5);
      const dur = rand(0.8, 1.6);
      const color = colors[Math.floor(rand(0, colors.length))];

      // Randomly use emoji or colored dots
      if (Math.random() > 0.5) {
        el.textContent = shapes[Math.floor(rand(0, shapes.length))];
        el.style.fontSize = size + "rem";
      } else {
        el.style.width = size * 8 + "px";
        el.style.height = size * 8 + "px";
        el.style.background = color;
      }

      el.style.left = cx + "px";
      el.style.top = cy + "px";
      el.style.position = "absolute";
      el.style.setProperty("--tx", tx + "px");
      el.style.setProperty("--ty", ty + "px");
      el.style.animationDuration = dur + "s";
      el.style.animationDelay = rand(0, 0.4) + "s";

      burst.appendChild(el);
      setTimeout(() => el.remove(), (dur + 0.5) * 1000);
    }

    // Also zoom the heart
    const finalHeart = qs("#finalHeart");
    if (finalHeart) {
      finalHeart.style.animation = "none";
      finalHeart.style.transform = "scale(1.6)";
      finalHeart.style.transition =
        "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)";
      setTimeout(() => {
        finalHeart.style.transform = "";
        finalHeart.style.animation = "";
      }, 700);
    }
  };

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setTimeout(fireParticles, 500);
        } else {
          triggered = false; // re-trigger on next visit
        }
      });
    },
    { threshold: 0.4 },
  );

  obs.observe(finalSection);
};

// ─── PARALLAX ───────────────────────────────
const initParallax = () => {
  const orbs = qsa(".orb");
  const hero = qs(".hero-blur-circle");

  const handleScroll = () => {
    const sy = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = 0.04 + i * 0.02;
      orb.style.transform = `translate(0, ${sy * speed}px) scale(${1 + i * 0.05})`;
    });
    if (hero) {
      hero.style.transform = `translate(-50%, calc(-50% + ${sy * 0.06}px))`;
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
};

// ─── MUSIC BUTTON ───────────────────────────
const initMusic = () => {
  const btn = qs("#musicBtn");
  const audio = qs("#bgMusic");
  const icon = qs("#musicIcon");
  if (!btn || !audio) return;

  let playing = false;

  // Note: audio src is empty by default — replace with a real URL to enable
  btn.addEventListener("click", () => {
    if (!audio.src || audio.src === window.location.href) {
      // No audio source — just animate for aesthetics
      playing = !playing;
      btn.classList.toggle("playing", playing);
      icon.textContent = playing ? "♫" : "♪";
      return;
    }

    if (playing) {
      audio.pause();
      btn.classList.remove("playing");
      icon.textContent = "♪";
    } else {
      audio.play().catch(() => {});
      btn.classList.add("playing");
      icon.textContent = "♫";
    }
    playing = !playing;
  });
};

// ─── BACK TO TOP ────────────────────────────
const initBackTop = () => {
  const btn = qs("#backTop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("visible", window.scrollY > 400);
    },
    { passive: true },
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
};

// ─── GLOW ON MOUSE MOVE (cards) ─────────────
const initCardGlow = () => {
  qsa(".quality-card, .memory").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--gx", x + "%");
      card.style.setProperty("--gy", y + "%");

      const glow = card.querySelector(".card-glow");
      if (glow) {
        glow.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(232,48,106,0.15), transparent 60%)`;
      }
    });
  });
};

// ─── SMOOTH SCROLL ───────────────────────────
const initSmoothScroll = () => {
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = qs(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
};

// ─── HERO NAME LETTER ANIMATION ─────────────
const initHeroName = () => {
  // Will be activated after entry screen dismissed
  // Just ensure the class hook is ready
};

// ─── INIT ALL ───────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  initCursor();
  initCanvas();
  initEntry();
  initHearts();
  initScrollReveal();
  initFinalBurst();
  initParallax();
  initMusic();
  initBackTop();
  initCardGlow();
  initSmoothScroll();
  initHeroName();
});
