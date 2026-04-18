/* ============================================================
   CUT & CONQUER — main.js
   Modules: Navbar | Scroll Reveal | Counters | FAQ |
            Hero Parallax | Forms | Toast | Footer Year
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─────────────────────────────────────────
   1. FOOTER YEAR
   ───────────────────────────────────────── */
function initFooterYear() {
  const el = $('#footerYear');
  if (el) el.textContent = new Date().getFullYear();
}

/* ─────────────────────────────────────────
   2. NAVBAR — scroll state + active link
   ───────────────────────────────────────── */
function initNavbar() {
  const navbar    = $('#navbar');
  const burger    = $('#burgerBtn');
  const mobileMenu = $('#mobileMenu');
  const mobileLinks = $$('.mobile-menu__link');
  const navLinks  = $$('.navbar__link');

  if (!navbar) return;

  /* Scroll class */
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Burger toggle */
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });

    /* Close on link click */
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    /* Close on outside click */
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target)) {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Active link on scroll */
  const sections = $$('section[id], div[id]');
  const observerOpts = { rootMargin: '-20% 0px -70% 0px' };
  const linkObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, observerOpts);
  sections.forEach(s => linkObserver.observe(s));
}

/* ─────────────────────────────────────────
   3. SCROLL REVEAL
   ───────────────────────────────────────── */
function initScrollReveal() {
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   4. ANIMATED COUNTERS
   ───────────────────────────────────────── */
function animateCounter(el) {
  const target   = parseFloat(el.dataset.count) || 0;
  const isDecimal = el.hasAttribute('data-decimal');
  const duration = 1800;
  const steps    = 60;
  const interval = duration / steps;
  let current    = 0;
  let frame      = 0;

  const timer = setInterval(() => {
    frame++;
    const progress = frame / steps;
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    current        = target * eased;

    el.textContent = isDecimal
      ? current.toFixed(1)
      : Math.round(current).toLocaleString();

    if (frame >= steps) {
      clearInterval(timer);
      el.textContent = isDecimal
        ? target.toFixed(1)
        : target.toLocaleString();
    }
  }, interval);
}

function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length || prefersReducedMotion()) {
    counters.forEach(el => {
      const target = parseFloat(el.dataset.count);
      const isDecimal = el.hasAttribute('data-decimal');
      el.textContent = isDecimal ? target.toFixed(1) : target.toLocaleString();
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   5. FAQ ACCORDION
   ───────────────────────────────────────── */
function initFAQ() {
  const items = $$('.faq__item');

  items.forEach(item => {
    const btn    = item.querySelector('.faq__question');
    const answer = item.querySelector('.faq__answer');
    if (!btn || !answer) return;

    /* Remove HTML hidden attr — we handle via CSS max-height */
    answer.removeAttribute('hidden');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all others */
      items.forEach(other => {
        if (other !== item) {
          const otherBtn    = other.querySelector('.faq__question');
          const otherAnswer = other.querySelector('.faq__answer');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAnswer) otherAnswer.style.maxHeight = '0';
          if (otherAnswer) otherAnswer.style.paddingBottom = '0';
        }
      });

      /* Toggle current */
      if (isOpen) {
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        answer.style.paddingBottom = '0';
      } else {
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        answer.style.paddingBottom = '24px';
      }
    });
  });
}

/* ─────────────────────────────────────────
   6. HERO IMAGE SEQUENCE (canvas 24 fps)
   ───────────────────────────────────────── */
function initHeroSequence() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx       = canvas.getContext('2d');
  const TOTAL     = 80;
  const FPS       = 24;
  const MS_PER_FR = 1000 / FPS;
  const PREFIX    = 'hero/A_smooth,_cinematic_202604161916_';

  /* Build ordered path list _000 … _079 */
  const paths = Array.from({ length: TOTAL }, (_, i) =>
    `${PREFIX}${String(i).padStart(3, '0')}.jpg`
  );

  /* ── Cover-fit draw (mirrors object-fit:cover) ── */
  function drawCover(img) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width,  ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale, dh = ih * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  /* ── Resize canvas resolution to match CSS size ── */
  function syncSize() {
    const w = canvas.offsetWidth  || window.innerWidth;
    const h = canvas.offsetHeight || window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      /* Redraw current frame immediately after resize */
      if (frames[currentFrame]) drawCover(frames[currentFrame]);
    }
  }

  /* ── State ── */
  const frames   = new Array(TOTAL).fill(null);
  let currentFrame = 0;
  let loadedCount  = 0;
  let lastTime     = 0;
  let rafId        = null;
  let playing      = false;

  /* ── Animation loop ── */
  function animate(ts) {
    rafId = requestAnimationFrame(animate);
    if (ts - lastTime < MS_PER_FR) return;
    lastTime = ts;

    /* Advance to next ready frame; skip if not yet decoded */
    const next = (currentFrame + 1) % TOTAL;
    if (frames[next]) {
      currentFrame = next;
      drawCover(frames[currentFrame]);
    }
  }

  /* ── Preload ── */
  canvas.classList.add('seq-loading');

  /* First frame priority — start playback the moment it's ready */
  const first = new Image();
  first.onload = () => {
    frames[0]    = first;
    loadedCount += 1;
    syncSize();
    drawCover(first);
    canvas.classList.remove('seq-loading');

    /* Respect prefers-reduced-motion — show static poster only */
    if (prefersReducedMotion()) return;

    playing = true;
    rafId   = requestAnimationFrame(animate);
  };
  first.onerror = () => canvas.classList.remove('seq-loading');
  first.src = paths[0];

  /* Load remaining frames in background */
  for (let i = 1; i < TOTAL; i++) {
    const img = new Image();
    img.onload  = () => { frames[i] = img; loadedCount += 1; };
    img.src     = paths[i];
  }

  /* Keep canvas resolution in sync on resize */
  const resizeObs = new ResizeObserver(syncSize);
  resizeObs.observe(canvas);

  /* Pause when tab is hidden — save CPU */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else if (playing && !prefersReducedMotion()) {
      rafId = requestAnimationFrame(animate);
    }
  });
}

/* ─────────────────────────────────────────
   6b. HERO PARALLAX (CSS transform, subtle)
   ───────────────────────────────────────── */
function initParallax() {
  if (prefersReducedMotion()) return;
  const heroBg = $('#heroCanvas') || $('.hero__bg-img');
  if (!heroBg) return;

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY <= window.innerHeight) {
          const offset = scrollY * 0.25;
          heroBg.style.transform = `scale(1.05) translateY(${offset}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ─────────────────────────────────────────
   7. GSAP ANIMATIONS (if available)
   ───────────────────────────────────────── */
function initGSAP() {
  if (typeof gsap === 'undefined' || prefersReducedMotion()) return;

  /* Register ScrollTrigger if available */
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* Hero entrance stagger */
  const heroEls = $$('.hero__content .reveal-up');
  if (heroEls.length) {
    gsap.fromTo(heroEls,
      { y: 50, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.18,
        duration: 1,
        ease: 'power3.out',
        delay: 0.3,
        onComplete: () => {
          /* Mark as visible so CSS fallback doesn't override */
          heroEls.forEach(el => el.classList.add('visible'));
        }
      }
    );
  }

  /* Gold glow button pulse */
  const goldBtns = $$('.btn--gold');
  goldBtns.forEach(btn => {
    if (!btn.closest('.navbar')) {
      gsap.to(btn, {
        boxShadow: '0 0 40px rgba(201,168,76,0.55)',
        duration: 1.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }
  });

  /* Service card icon rotation hover effect */
  if (typeof ScrollTrigger !== 'undefined') {
    $$('.stat-card').forEach(card => {
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.fromTo(card.querySelector('.stat-card__icon'),
            { scale: 0, rotation: -30, opacity: 0 },
            { scale: 1, rotation: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
          );
        },
        once: true,
      });
    });
  }
}

/* ─────────────────────────────────────────
   8. TOAST NOTIFICATION
   ───────────────────────────────────────── */
function showToast(message, duration = 4000) {
  const toast = $('#toast');
  const msg   = $('#toastMsg');
  if (!toast || !msg) return;

  msg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

/* ─────────────────────────────────────────
   9. BOOKING FORM
   ───────────────────────────────────────── */
function initBookingForm() {
  const form = $('#bookingForm');
  if (!form) return;

  /* Set min date to today */
  const dateInput = $('#apptDate');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = $('#bookingSubmit');

    /* Simple validation */
    const name    = $('#fullName')?.value.trim();
    const phone   = $('#phoneNum')?.value.trim();
    const service = $('#serviceSelect')?.value;
    const date    = $('#apptDate')?.value;

    if (!name || !phone || !service || !date) {
      showToast('Please fill in all required fields.');
      return;
    }

    /* Simulate submission */
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Booking…';
    }

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Confirm My Appointment';
      }
      form.reset();
      showToast('🎉 Appointment booked! We\'ll confirm via text shortly.');
    }, 1800);
  });
}

/* ─────────────────────────────────────────
   10. NEWSLETTER FORM
   ───────────────────────────────────────── */
function initNewsletter() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#newsletterEmail')?.value.trim();
    const btn   = $('#newsletterSubmit');

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    }

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane" aria-hidden="true"></i><span>Claim Offer</span>';
      }
      form.reset();
      showToast('Welcome to the inner circle! Your 20% code is on its way.');
    }, 1500);
  });
}

/* ─────────────────────────────────────────
   11. SMOOTH SCROLL (fallback for older browsers)
   ───────────────────────────────────────── */
function initSmoothScroll() {
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ─────────────────────────────────────────
   12. BUTTON RIPPLE (micro-interaction)
   ───────────────────────────────────────── */
function initRipple() {
  if (prefersReducedMotion()) return;

  $$('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        border-radius:50%;
        background:rgba(255,255,255,0.2);
        width:10px; height:10px;
        top:${y - 5}px; left:${x - 5}px;
        transform:scale(0);
        transition:transform 0.5s ease, opacity 0.5s ease;
        opacity:1;
        pointer-events:none;
        z-index:10;
      `;
      this.style.position = 'relative';
      this.appendChild(ripple);

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(30)';
        ripple.style.opacity   = '0';
      });

      ripple.addEventListener('transitionend', () => ripple.remove());
    });
  });
}

/* ─────────────────────────────────────────
   INIT — wait for DOM
   ───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initNavbar();
  initHeroSequence();   // ← canvas image sequence
  initScrollReveal();
  initCounters();
  initFAQ();
  initParallax();
  initBookingForm();
  initNewsletter();
  initSmoothScroll();
  initRipple();
});

/* GSAP loads async — init after load event */
window.addEventListener('load', () => {
  initGSAP();
});
