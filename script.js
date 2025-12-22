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
  // Contact form (Formspree + fallback mailto link)
  // -----------------------------
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");

  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    function setNote(kind, message) {
      if (!formNote) return;
      formNote.classList.remove("form__note--success", "form__note--error");
      if (kind === "success") formNote.classList.add("form__note--success");
      if (kind === "error") formNote.classList.add("form__note--error");
      formNote.textContent = message;
    }

    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Basic client-side validation (uses native browser rules)
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        setNote("error", "Please fill out all required fields.");
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      setNote(null, "Sending…");

      try {
        const res = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          contactForm.reset();
          setNote("success", "Thank you—your message has been sent. We’ll reply soon.");
        } else {
          setNote(
            "error",
            "Sorry—something went wrong sending your message. Please try again, or use the email link below."
          );
        }
      } catch {
        setNote(
          "error",
          "Network issue—couldn’t send right now. Please try again, or use the email link below."
        );
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
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

  // -----------------------------
  // Floating "Back to top" pill
  // -----------------------------
  const toTop = document.getElementById("toTop");
  const TOP_SHOW_AFTER_PX = 400;

  function updateToTopVisibility() {
    if (!toTop) return;
    const show = window.scrollY > TOP_SHOW_AFTER_PX;
    toTop.classList.toggle("is-visible", show);
  }

  // Keep it responsive without spamming layout on every scroll tick.
  let toTopTicking = false;
  window.addEventListener("scroll", () => {
    if (toTopTicking) return;
    toTopTicking = true;
    window.requestAnimationFrame(() => {
      updateToTopVisibility();
      toTopTicking = false;
    });
  });
  updateToTopVisibility();

  // Reliable scroll-to-top (still keeps #top for no-JS fallback)
  if (toTop) {
    toTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // -----------------------------
  // Initialize theme from localStorage + wire the toggle
  //
  // IMPORTANT:
  // Snow functions reference `canvas`/`ctx`, so we only call setChristmasMode()
  // after the snow canvas variables have been initialized above.
  // -----------------------------
  const saved = localStorage.getItem(STORAGE_KEY);
  const shouldEnable = saved === "christmas";
  setChristmasMode(shouldEnable);

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      setChristmasMode(themeToggle.checked);
    });
  }
})();

