/*
  Minimal vanilla JS for:
  - Scroll-reveal animations (gentle, accessible)
  - Christmas Mode toggle (theme switching + localStorage persistence)
  - Lightweight falling snow overlay (canvas; paused/disabled with reduced-motion)
  - Contact form mailto draft helper (frontend-only)
*/

(() => {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const yearEl = document.getElementById("year");

  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // -----------------------------
  // Footer year
  // -----------------------------
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // -----------------------------
  // Scroll reveal (IntersectionObserver)
  // -----------------------------
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  if (prefersReducedMotion) {
    // If the user requests reduced motion, make everything visible immediately.
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Older browsers fallback: just show everything.
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // -----------------------------
  // Contact form (mailto draft)
  // -----------------------------
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const CONTACT_EMAIL = "you@example.com"; // <-- Customize this later (one place!)

  // Replace placeholder email in the page so you only update CONTACT_EMAIL above.
  // (This keeps index.html beginner-friendly while avoiding duplicated edits.)
  for (const a of document.querySelectorAll('a[href^="mailto:"]')) {
    const rawHref = a.getAttribute("href") || "";
    if (rawHref.includes("you@example.com")) {
      a.setAttribute("href", rawHref.replaceAll("you@example.com", CONTACT_EMAIL));
    }
    if (a.textContent?.includes("you@example.com")) {
      a.textContent = a.textContent.replaceAll("you@example.com", CONTACT_EMAIL);
    }
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const fd = new FormData(contactForm);
      const name = String(fd.get("name") ?? "").trim();
      const email = String(fd.get("email") ?? "").trim();
      const message = String(fd.get("message") ?? "").trim();

      const subject = `Coaching Inquiry${name ? ` — ${name}` : ""}`;
      const bodyLines = [
        "Hello!",
        "",
        "I'd like to book a free consultation / learn more about coaching.",
        "",
        `Name: ${name || "(not provided)"}`,
        `Email: ${email || "(not provided)"}`,
        "",
        "Message:",
        message || "(no message)",
        "",
        "— Sent from the Butterfly Bloom website",
      ];

      const mailto =
        `mailto:${encodeURIComponent(CONTACT_EMAIL)}` +
        `?subject=${encodeURIComponent(subject)}` +
        `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

      if (formNote) {
        formNote.textContent = "Opening your email app with a drafted message…";
      }

      // Using location.href keeps it simple and works on GitHub Pages.
      window.location.href = mailto;
    });
  }

  // -----------------------------
  // Christmas Mode toggle + persistence
  // -----------------------------
  const STORAGE_KEY = "bb_theme"; // saved as "christmas" or "light"

  function isChristmasMode() {
    return html.getAttribute("data-theme") === "christmas";
  }

  function setChristmasMode(enabled) {
    if (enabled) {
      html.setAttribute("data-theme", "christmas");
      localStorage.setItem(STORAGE_KEY, "christmas");
      startSnow();
    } else {
      html.removeAttribute("data-theme");
      localStorage.setItem(STORAGE_KEY, "light");
      stopSnow();
    }

    if (themeToggle) themeToggle.checked = enabled;
  }

  // Initialize from localStorage
  const saved = localStorage.getItem(STORAGE_KEY);
  const shouldEnable = saved === "christmas";
  setChristmasMode(shouldEnable);

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      setChristmasMode(themeToggle.checked);
    });
  }

  // -----------------------------
  // Snow overlay (lightweight canvas)
  // -----------------------------
  const canvas = document.getElementById("snow");
  const ctx = canvas?.getContext?.("2d");

  let rafId = null;
  let flakes = [];
  let w = 0;
  let h = 0;
  let dpr = 1;

  function resizeCanvas() {
    if (!canvas || !ctx) return;

    dpr = Math.min(2, window.devicePixelRatio || 1); // cap for performance
    w = canvas.clientWidth || window.innerWidth;
    h = canvas.clientHeight || window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
  }

  function makeFlake() {
    // Gentle, low-density flakes (CSS pixel units)
    const radius = 0.8 + Math.random() * 2.2;
    return {
      x: Math.random() * w,
      y: -10 - Math.random() * h,
      r: radius,
      vy: 0.35 + Math.random() * 0.9,
      vx: -0.18 + Math.random() * 0.36,
      alpha: 0.16 + Math.random() * 0.26,
    };
  }

  function resetFlakes() {
    if (!canvas || !ctx) return;
    // Density scales with area but stays capped and calm.
    const target = Math.min(90, Math.max(28, Math.floor((w * h) / 42000)));
    flakes = Array.from({ length: target }, makeFlake);
  }

  function stepSnow() {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, w, h);

    // A tiny wind drift that changes slowly.
    const wind = Math.sin(Date.now() / 4500) * 0.25;

    for (const f of flakes) {
      f.y += f.vy;
      f.x += f.vx + wind;

      // Wrap around edges
      if (f.y - f.r > h + 6) {
        f.y = -8;
        f.x = Math.random() * w;
      }
      if (f.x < -10) f.x = w + 10;
      if (f.x > w + 10) f.x = -10;

      // Cozy “off-white” snow in Christmas mode
      ctx.fillStyle = `rgba(244, 240, 234, ${f.alpha})`;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fill();
    }

    rafId = window.requestAnimationFrame(stepSnow);
  }

  function startSnow() {
    // Snow only runs in Christmas Mode and when motion is allowed.
    if (prefersReducedMotion) return;
    if (!canvas || !ctx) return;
    if (!isChristmasMode()) return;
    if (rafId) return; // already running

    resizeCanvas();
    resetFlakes();
    rafId = window.requestAnimationFrame(stepSnow);
  }

  function stopSnow() {
    if (!canvas || !ctx) return;
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    ctx.clearRect(0, 0, w, h);
  }

  // Keep snow crisp on resize (and keep density correct)
  window.addEventListener("resize", () => {
    if (!isChristmasMode()) return;
    if (prefersReducedMotion) return;
    resizeCanvas();
    resetFlakes();
  });

  // Pause when tab is hidden (saves CPU)
  document.addEventListener("visibilitychange", () => {
    if (!isChristmasMode()) return;
    if (document.hidden) stopSnow();
    else startSnow();
  });
})();

