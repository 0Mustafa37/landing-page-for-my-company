/* ==========================================================
   Config
   ----------------------------------------------------------
   The contact form opens a WhatsApp chat to WHATSAPP_NUMBER
   with the visitor's details filled in. To collect submissions
   on a server instead, set FORM_ENDPOINT to a form backend URL
   (e.g. Formspree: "https://formspree.io/f/your-id").
   ========================================================== */
const FORM_ENDPOINT = "";
const WHATSAPP_NUMBER = "201019959218"; // 0101 995 9218, international format without "+"
const CONTACT_EMAIL = "tanzim.eg@gmail.com";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;
const hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
const animate = hasGSAP && !reducedMotion;

/* ==========================================================
   Language (Arabic default, English optional)
   ----------------------------------------------------------
   The inline script in <head> already set <html lang/dir>.
   Arabic copy is in the HTML; English comes from js/i18n.js.
   ========================================================== */
const root = document.documentElement;
if (!window.I18N) { root.lang = "ar"; root.dir = "rtl"; } // translations missing: stay Arabic
const LANG = root.lang === "en" ? "en" : "ar";
const isRTL = LANG === "ar";
const T = window.I18N ? window.I18N.ui[LANG] : {};

function applyTranslations(dict) {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = dict[el.dataset.i18n];
    if (v != null) el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const v = dict[el.dataset.i18nHtml];
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      if (dict[key] != null) el.setAttribute(attr, dict[key]);
    });
  });
}

if (LANG === "en") applyTranslations(window.I18N.en);

/* ==========================================================
   Theme (dark default, light optional)
   ----------------------------------------------------------
   The inline script in <head> already set data-theme.
   ========================================================== */
const themeToggle = document.querySelector("[data-theme-toggle]");
const themeColor = document.querySelector("[data-theme-color]");

function setTheme(theme, animateChange) {
  if (animateChange) {
    root.classList.add("theme-anim");
    setTimeout(() => root.classList.remove("theme-anim"), 500);
  }
  root.setAttribute("data-theme", theme);
  if (themeColor) themeColor.content = theme === "light" ? "#f5f6fb" : "#05060a";
  if (themeToggle) themeToggle.setAttribute("aria-label", theme === "light" ? T.themeToDark : T.themeToLight);
  try { localStorage.setItem("theme", theme); } catch (e) {}
}
setTheme(root.getAttribute("data-theme") === "light" ? "light" : "dark", false);
if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "light" ? "dark" : "light", true);
  });
}

/* WhatsApp links open with a greeting in the visitor's language */
document.querySelectorAll("[data-wa]").forEach((link) => {
  if (T.waGreeting) link.href = `${link.href.split("?")[0]}?text=${encodeURIComponent(T.waGreeting)}`;
});
try { localStorage.setItem("lang", LANG); } catch (e) {}

document.querySelectorAll("[data-lang-switch]").forEach((link) => {
  const to = T.switchTo;
  if (!to) return;
  const url = new URL(location.href);
  url.hash = "";
  if (to.lang === "ar") url.searchParams.delete("lang");
  else url.searchParams.set("lang", to.lang);
  link.href = url.toString();
  link.hreflang = to.lang;
  link.lang = to.lang;
  link.textContent = link.classList.contains("lang-switch-text") ? to.text : to.label;
  link.setAttribute("aria-label", to.aria);
  link.addEventListener("click", () => {
    try {
      localStorage.setItem("lang", to.lang);
      sessionStorage.setItem("quickIntro", "1");
    } catch (e) {}
  });
});

document.getElementById("year").textContent = new Date().getFullYear();

/* ==========================================================
   Split text into masked words
   ========================================================== */
function splitWords(el) {
  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
          } else {
            const word = document.createElement("span");
            word.className = "word";
            const inner = document.createElement("span");
            inner.className = "word-inner";
            inner.textContent = part;
            word.appendChild(inner);
            frag.appendChild(word);
          }
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
  return el.querySelectorAll(".word-inner");
}

/* ==========================================================
   Smooth scroll (Lenis)
   ========================================================== */
let lenis = null;
if (animate && typeof window.Lenis !== "undefined") {
  lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
  if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -90, duration: 1.4 });
  else if (target === 0) window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  else target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id === "#" || id === "#main") return;
    e.preventDefault();
    setMenu(false);
    scrollToTarget(id === "#top" ? 0 : document.querySelector(id));
  });
});

/* ==========================================================
   Header: hide on scroll down, show on scroll up
   ========================================================== */
const header = document.querySelector(".site-header");
const progress = document.querySelector(".scroll-progress");
let lastY = 0;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  const menuOpen = menu.classList.contains("open");
  header.classList.toggle("hide", y > 300 && y > lastY && !menuOpen);
  lastY = y;
}
window.addEventListener("scroll", onScroll, { passive: true });

/* ==========================================================
   Mobile nav
   ========================================================== */
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");
function setMenu(open) {
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? T.menuClose : T.menuOpen);
}
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
onScroll();

/* ==========================================================
   Custom cursor
   ========================================================== */
if (finePointer && !reducedMotion) {
  document.documentElement.classList.add("has-cursor");
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };

  window.addEventListener("mousemove", (e) => {
    pos.x = e.clientX; pos.y = e.clientY;
    dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
  }, { passive: true });

  (function loop() {
    ringPos.x += (pos.x - ringPos.x) * 0.18;
    ringPos.y += (pos.y - ringPos.y) * 0.18;
    ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener("mouseover", (e) => {
    ring.classList.toggle("hover", Boolean(e.target.closest("a, button, input, textarea, [data-magnetic]")));
  });
  document.addEventListener("mouseleave", () => { dot.classList.add("hidden"); ring.classList.add("hidden"); });
  document.addEventListener("mouseenter", () => { dot.classList.remove("hidden"); ring.classList.remove("hidden"); });
}

/* ==========================================================
   Magnetic buttons
   ========================================================== */
if (animate && finePointer) {
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    const inner = el.querySelector("span");
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      gsap.to(el, { x: x * 0.3, y: y * 0.4, duration: 0.6, ease: "power3.out" });
      if (inner) gsap.to(inner, { x: x * 0.15, y: y * 0.2, duration: 0.6, ease: "power3.out" });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to([el, inner], { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" });
    });
  });
}

/* ==========================================================
   Bento spotlight (follows cursor across all cards)
   ========================================================== */
const bento = document.querySelector(".bento");
if (bento && finePointer) {
  bento.addEventListener("mousemove", (e) => {
    bento.querySelectorAll(".bento-card").forEach((card) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });
}

/* ==========================================================
   Hero: 3D tilt on the product mockup
   ========================================================== */
const mock = document.querySelector("[data-tilt]");
const hero = document.querySelector(".hero");
if (animate && finePointer && mock) {
  hero.addEventListener("mousemove", (e) => {
    const r = hero.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(mock, { rotateY: px * 10, rotateX: -py * 8, duration: 1, ease: "power3.out" });
    gsap.to(".float-chip", { x: (i) => px * (20 + i * 12), y: (i) => py * (16 + i * 10), duration: 1.2, ease: "power3.out" });
  });
  hero.addEventListener("mouseleave", () => {
    gsap.to(mock, { rotateY: 0, rotateX: 0, duration: 1.2, ease: "power3.out" });
  });
}

/* ==========================================================
   Hero: live dashboard ticker
   ========================================================== */
const feed = document.querySelector(".mock-feed");
const presentEl = document.querySelector('[data-live="present"]');
const TOTAL_STAFF = 150;
let present = 142;

function bump(el, text) {
  el.textContent = text;
  el.classList.remove("tick");
  void el.offsetWidth; // restart animation
  el.classList.add("tick");
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function feedText(template) {
  return template
    .replace("{n}", pick(T.names))
    .replace("{b}", pick(T.branches))
    .replace("{w}", pick(T.warehouses))
    .replace("{q}", 5 + Math.floor(Math.random() * 40))
    .replace("{i}", pick(T.items))
    .replace("{a}", pick(T.assets));
}

if (!reducedMotion && feed && T.feed) {
  setInterval(() => {
    if (document.hidden) return;
    // Mostly check-ins while staff are still arriving, then a mix of everything else
    const checkIn = present < TOTAL_STAFF && Math.random() < 0.45;
    const [state, template] = checkIn ? T.feed[0] : pick(T.feed.slice(1));
    const li = document.createElement("li");
    li.className = "enter";
    li.innerHTML = `<b class="dot ${state}"></b><span>${feedText(template)}</span><time>${T.now}</time>`;
    feed.prepend(li);
    feed.querySelectorAll("li time").forEach((t, i) => { if (i === 1) t.textContent = T.oneMin; });
    while (feed.children.length > 3) feed.lastElementChild.remove();
    if (checkIn) bump(presentEl, `${++present}/${TOTAL_STAFF}`);
  }, 2800);
}

/* ==========================================================
   Hero: interactive particle field
   ========================================================== */
const canvas = document.querySelector(".hero-canvas");
if (canvas && !reducedMotion) {
  const ctx = canvas.getContext("2d");
  const mouse = { x: -9999, y: -9999 };
  let w, h, dpr, particles = [], running = true;
  const colors = ["139,92,246", "34,211,238", "244,114,182"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.offsetWidth; h = canvas.offsetHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(110, Math.floor((w * h) / 14000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
  }

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Gentle repulsion from the cursor
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 140 && dist > 0) {
        const f = (140 - dist) / 140;
        p.vx += (dx / dist) * f * 0.25;
        p.vy += (dy / dist) * f * 0.25;
      }
      p.vx *= 0.97; p.vy *= 0.97;
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.c},.85)`;
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(${p.c},${(1 - d / 120) * 0.22})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener("resize", resize);
  hero.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -9999; });
  new IntersectionObserver(([entry]) => {
    const wasRunning = running;
    running = entry.isIntersecting;
    if (running && !wasRunning) draw();
  }).observe(canvas);
}

/* ==========================================================
   Counters
   ========================================================== */
function formatCount(el, value) {
  const decimals = Number(el.dataset.decimals || 0);
  const n = Number(value).toFixed(decimals);
  return el.hasAttribute("data-format") ? Number(n).toLocaleString("en-US") : n;
}
const counters = document.querySelectorAll("[data-count]");

/* ==========================================================
   Preloader + GSAP choreography
   ========================================================== */
const preloader = document.querySelector(".preloader");

function hidePreloaderSimple() {
  preloader.style.transition = "opacity .5s ease";
  preloader.style.opacity = "0";
  setTimeout(() => preloader.remove(), 500);
}

if (!animate) {
  // No GSAP (offline CDN) or reduced motion: show everything immediately
  counters.forEach((el) => (el.textContent = formatCount(el, el.dataset.count)));
  hidePreloaderSimple();
} else {
  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add("is-loading");
  if (lenis) lenis.stop();

  /* Split headings up-front so they start hidden */
  const heroWords = splitWords(document.querySelector(".hero-title"));
  gsap.set(heroWords, { yPercent: 110 });
  gsap.set([".hero-badge", ".hero-lead", ".hero-actions", ".hero-note"], { autoAlpha: 0, y: 30 });
  gsap.set(".hero-visual", { autoAlpha: 0, y: 120, scale: 0.92 });
  gsap.set(".float-chip", { autoAlpha: 0, scale: 0.6 });
  gsap.set(".site-header", { autoAlpha: 0, y: -30 });

  /* Preloader counter */
  const count = { v: 0 };
  let quickIntro = false;
  try {
    quickIntro = sessionStorage.getItem("quickIntro") === "1";
    sessionStorage.removeItem("quickIntro");
  } catch (e) {}
  const bar = document.querySelector(".preloader-bar i");
  const countEl = document.querySelector(".preloader-count");
  const intro = gsap.timeline();

  intro
    .to(count, {
      v: 100, duration: quickIntro ? 0.4 : 1.4, ease: "power2.inOut",
      onUpdate: () => {
        countEl.textContent = Math.round(count.v);
        bar.style.width = `${count.v}%`;
      },
    })
    .to(".preloader-inner", { autoAlpha: 0, y: -20, duration: 0.4, ease: "power2.in" })
    .to(preloader, { yPercent: -100, duration: 0.9, ease: "expo.inOut" })
    .add(() => {
      preloader.remove();
      document.body.classList.remove("is-loading");
      if (lenis) lenis.start();
    })
    .to(".site-header", { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out" }, "-=0.45")
    .to(".hero-badge", { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out" }, "<")
    .to(heroWords, { yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.07 }, "<0.1")
    .to(".hero-lead", { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out" }, "<0.4")
    .to([".hero-actions", ".hero-note"], { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.1 }, "<0.15")
    .to(".hero-visual", { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: "expo.out" }, "<0.1")
    .to(".float-chip", { autoAlpha: 1, scale: 1, duration: 0.9, ease: "back.out(1.8)", stagger: 0.15 }, "<0.6");

  /* Hero parallax on scroll */
  gsap.to(".hero-visual", {
    yPercent: -8, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to([".hero-glow", ".hero-canvas"], {
    yPercent: 30, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* Section headings: word reveal */
  document.querySelectorAll("[data-split]:not(.hero-title)").forEach((el) => {
    const words = splitWords(el);
    gsap.from(words, {
      yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  /* Fade-up elements */
  gsap.utils.toArray("[data-fade], .section-head .eyebrow, .hscroll-head .eyebrow, .contact-copy .eyebrow").forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0, y: 30, duration: 1, ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });

  /* Cards / blocks: staggered rise */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: (batch) => gsap.fromTo(batch,
      { autoAlpha: 0, y: 70, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 1.2, ease: "expo.out", stagger: 0.12, overwrite: true }),
  });
  gsap.set("[data-reveal]", { autoAlpha: 0 });

  /* Statement: words light up as you scroll */
  const statement = document.querySelector("[data-highlight]");
  if (statement) {
    const words = splitWords(statement);
    gsap.set(words, { opacity: 0.12 });
    gsap.to(words, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: statement, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  /* Logo marquee fade in */
  gsap.from(".logos", { autoAlpha: 0, y: 40, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".logos", start: "top 90%" } });

  /* Counters */
  counters.forEach((el) => {
    const obj = { v: 0 };
    gsap.to(obj, {
      v: Number(el.dataset.count), duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => (el.textContent = formatCount(el, obj.v)),
    });
  });

  /* How it works: pinned horizontal scroll on desktop */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const track = document.querySelector(".hscroll-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      // RTL content overflows to the left, so the track moves the other way
      x: () => (isRTL ? distance() : -distance()), ease: "none",
      scrollTrigger: {
        trigger: ".hscroll", start: "top top", end: () => `+=${distance()}`,
        pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    gsap.from(".step-card", {
      autoAlpha: 0, x: isRTL ? -120 : 120, rotate: isRTL ? -3 : 3, duration: 1.2, ease: "expo.out", stagger: 0.1,
      scrollTrigger: { trigger: ".hscroll", start: "top 70%" },
    });
  });
  mm.add("(max-width: 899px)", () => {
    gsap.utils.toArray(".step-card").forEach((card) => {
      gsap.from(card, { autoAlpha: 0, y: 60, duration: 1, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 88%" } });
    });
  });

  /* Footer mega type */
  gsap.from(".footer-mega", {
    yPercent: 40, autoAlpha: 0, ease: "none",
    scrollTrigger: { trigger: ".site-footer", start: "top bottom", end: "bottom bottom", scrub: true },
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ==========================================================
   Contact form
   ========================================================== */
const form = document.getElementById("contact-form");
const statusEl = form.querySelector(".form-status");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?\d{8,15}$/;

// Accept Arabic-Indic digits (٠١٢…) and spaces/dashes, e.g. "٠١٠ ١٢٣٤ ٥٦٧٨"
function normalizePhone(value) {
  return value
    .replace(/[\u0660-\u0669]/g, (d) => d.charCodeAt(0) - 0x0660)
    .replace(/[\u06F0-\u06F9]/g, (d) => d.charCodeAt(0) - 0x06F0)
    .replace(/[\s()-]/g, "");
}

function setError(input, message) {
  const field = input.closest(".field");
  field.classList.remove("invalid");
  if (message) {
    void field.offsetWidth; // replay shake animation
    field.classList.add("invalid");
  }
  field.querySelector(".error").textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validate() {
  const { name, phone, email, message } = form.elements;
  let firstInvalid = null;

  const checks = [
    [name, name.value.trim() ? "" : T.errName],
    [phone, PHONE_RE.test(normalizePhone(phone.value)) ? "" : T.errPhone],
    [email, !email.value.trim() || EMAIL_RE.test(email.value.trim()) ? "" : T.errEmailInvalid],
    [message, message.value.trim().length >= 10 ? "" : T.errMessage],
  ];

  checks.forEach(([input, msg]) => {
    setError(input, msg);
    if (msg && !firstInvalid) firstInvalid = input;
  });

  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

form.addEventListener("input", (e) => {
  if (e.target.closest(".field.invalid")) setError(e.target, "");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  statusEl.className = "form-status";
  statusEl.textContent = "";

  if (!validate()) return;
  if (form.elements._gotcha.value) return; // bot filled the honeypot

  const data = new FormData(form);

  if (!FORM_ENDPOINT) {
    const lines = [
      T.waGreeting,
      "",
      data.get("message").trim(),
      "",
      `${T.nameLabel}: ${data.get("name").trim()}`,
      `${T.phoneLabel}: ${normalizePhone(data.get("phone"))}`,
    ];
    if (data.get("email").trim()) lines.push(`${T.emailLabel}: ${data.get("email").trim()}`);
    if (data.get("company").trim()) lines.push(`${T.companyLabel}: ${data.get("company").trim()}`);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url; // popup blocked: open in this tab
    statusEl.classList.add("success");
    statusEl.textContent = T.opening;
    return;
  }

  const button = form.querySelector("button[type=submit]");
  const label = button.querySelector("span");
  button.disabled = true;
  label.textContent = T.sending;

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    statusEl.classList.add("success");
    statusEl.textContent = T.success;
  } catch {
    statusEl.classList.add("fail");
    statusEl.textContent = `${T.fail} ${CONTACT_EMAIL}`;
  } finally {
    button.disabled = false;
    label.textContent = T.send;
  }
});
