/* ==========================================================
   Config
   ----------------------------------------------------------
   Set FORM_ENDPOINT to a form backend URL (e.g. Formspree:
   "https://formspree.io/f/your-id") to receive submissions.
   Leave it empty to fall back to opening the visitor's email
   client addressed to CONTACT_EMAIL.
   ========================================================== */
const FORM_ENDPOINT = "";
const CONTACT_EMAIL = "hello@example.com";

/* Footer year */
document.getElementById("year").textContent = new Date().getFullYear();

/* Header border on scroll */
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* Mobile nav */
const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("nav-menu");

function setMenu(open) {
  menu.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}

toggle.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
menu.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* Stagger chart bars */
document.querySelectorAll(".mock-chart i").forEach((bar, i) => bar.style.setProperty("--i", i));

/* Scroll reveal */
const reveals = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  reveals.forEach((el, i) => {
    el.style.transitionDelay = `${(i % 3) * 80}ms`;
    io.observe(el);
  });
} else {
  reveals.forEach((el) => el.classList.add("visible"));
}

/* Contact form */
const form = document.getElementById("contact-form");
const statusEl = form.querySelector(".form-status");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setError(input, message) {
  const field = input.closest(".field");
  field.classList.toggle("invalid", Boolean(message));
  field.querySelector(".error").textContent = message;
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

function validate() {
  const { name, email, message } = form.elements;
  let firstInvalid = null;

  const checks = [
    [name, name.value.trim() ? "" : "Please enter your name."],
    [email, !email.value.trim() ? "Please enter your email." : EMAIL_RE.test(email.value.trim()) ? "" : "Please enter a valid email address."],
    [message, message.value.trim().length >= 10 ? "" : "Please write at least 10 characters."],
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
    const subject = encodeURIComponent(`Inquiry from ${data.get("name")}`);
    const body = encodeURIComponent(
      `${data.get("message")}\n\n— ${data.get("name")}\n${data.get("email")}${data.get("company") ? `\n${data.get("company")}` : ""}`
    );
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    statusEl.classList.add("success");
    statusEl.textContent = "Opening your email app…";
    return;
  }

  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  button.textContent = "Sending…";

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.reset();
    statusEl.classList.add("success");
    statusEl.textContent = "Thanks! We'll be in touch within one business day.";
  } catch {
    statusEl.classList.add("fail");
    statusEl.textContent = `Something went wrong. Please email us at ${CONTACT_EMAIL}.`;
  } finally {
    button.disabled = false;
    button.textContent = "Send message";
  }
});
