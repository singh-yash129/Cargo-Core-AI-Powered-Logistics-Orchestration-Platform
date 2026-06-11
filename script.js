/* ══════════════════════════════════════════════
   CARGO-CORE  |  Premium Interactive Experience
   ══════════════════════════════════════════════ */

'use strict';

/* ─── CONFIG ─────────────────────────────────── */
const DECK_PDF_PATH = 'deck.pdf';
const SLIDE_AUTO_MS = 6000; // ms per slide in auto mode

/* ─── CANVAS PARTICLE FIELD ──────────────────── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const COLORS = ['#00d4ff', '#00f5a4', '#8b5cf6', '#f5c842'];

  let W, H, particles = [], animId;
  const COUNT = window.innerWidth < 600 ? 50 : 110;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.08 + Math.random() * 0.18;
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     0.6 + Math.random() * 1.6,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      alpha: 0.15 + Math.random() * 0.55,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life:  0,
      maxLife: 200 + Math.random() * 400,
    };
  }

  function setup() {
    particles = [];
    for (let i = 0; i < COUNT; i++) {
      const p = mkParticle();
      p.life = Math.random() * p.maxLife; // stagger
      particles.push(p);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw connection lines between close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const alpha = (1 - dist / 120) * 0.06;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      p.life++;
      const progress = p.life / p.maxLife;
      const fadeAlpha = progress < 0.1
        ? progress / 0.1
        : progress > 0.85
          ? (1 - progress) / 0.15
          : 1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha * fadeAlpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.life >= p.maxLife) {
        Object.assign(p, mkParticle());
        p.life = 0;
      }
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;
    });

    animId = requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    resize();
    setup();
  });
  resize();
  setup();
  draw();
})();

/* ─── SCROLL PROGRESS BAR ────────────────────── */
(function initProgress() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = max > 0 ? (window.scrollY / max * 100) + '%' : '0%';
  }, { passive: true });
})();

/* ─── NAVBAR SCROLL STATE ────────────────────── */
(function initNav() {
  const nav = document.getElementById('topbar');
  if (!nav) return;
  const toggle = () => nav.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
})();

/* ─── SMOOTH REVEAL ON SCROLL ────────────────── */
(function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );
  els.forEach((el) => io.observe(el));
})();

/* ─── COUNTER ANIMATION ──────────────────────── */
(function initCounters() {
  const nums = document.querySelectorAll('[data-count]');
  if (!nums.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el  = e.target;
        const end = parseInt(el.dataset.count, 10);
        const dur = 1600;
        const step = 16;
        const inc  = end / (dur / step);
        let cur = 0;
        const tick = () => {
          cur = Math.min(cur + inc, end);
          el.textContent = Math.round(cur);
          if (cur < end) setTimeout(tick, step);
        };
        tick();
        io.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  nums.forEach((n) => io.observe(n));
})();

/* ─── MAGNETIC 3-D TILT ──────────────────────── */
(function initTilt() {
  const cards = document.querySelectorAll('.dev-card, .link-card, .media-card');

  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top)  / rect.height;
      const tX = (py - 0.5) * -10;
      const tY = (px - 0.5) *  12;

      card.style.transform =
        `perspective(1000px) rotateX(${tX}deg) rotateY(${tY}deg) scale(1.025) translateY(-4px)`;

      // spotlight
      card.style.setProperty('--x', `${px * 100}%`);
      card.style.setProperty('--y', `${py * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ─── CUSTOM CURSOR ──────────────────────────── */
(function initCursor() {
  // Only on non-touch devices
  if ('ontouchstart' in window) return;

  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = -100, my = -100, rx = -100, ry = -100;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
    dot.style.opacity = '1';
    ring.style.opacity = '1';
  });

  function animateRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover state
  const hovers = document.querySelectorAll('a, button, .dev-card, .link-card, .btn');
  hovers.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      dot.style.width     = '14px';
      dot.style.height    = '14px';
      dot.style.background = '#fff';
      ring.style.width    = '54px';
      ring.style.height   = '54px';
      ring.style.borderColor = 'rgba(0,212,255,0.7)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width     = '8px';
      dot.style.height    = '8px';
      dot.style.background = 'var(--cyan)';
      ring.style.width    = '36px';
      ring.style.height   = '36px';
      ring.style.borderColor = 'rgba(0,212,255,0.45)';
    });
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
})();

/* ─── HAMBURGER NAV ────────────────────────── */
(function initHamburger() {
  const toggle  = document.getElementById('navToggle');
  const drawer  = document.getElementById('mobileNav');
  if (!toggle || !drawer) return;

  function openNav() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close navigation menu');
  }
  function closeNav() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  }

  toggle.addEventListener('click', () =>
    drawer.classList.contains('is-open') ? closeNav() : openNav()
  );

  // Close on any link click
  drawer.querySelectorAll('.mobile-nav-link').forEach((link) =>
    link.addEventListener('click', closeNav)
  );

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !drawer.contains(e.target)) closeNav();
  });
})();

/* ─── DEMO VIDEO LAZY LOAD ───────────────────── */
(function initDemoFrame() {
  const frame = document.getElementById('demoFrame');
  if (!frame) return;
  const DEMO_URL = 'https://www.youtube.com/embed/6y2ql3q6HR4?autoplay=1&mute=0&controls=1&rel=0&playsinline=1';
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        frame.src = DEMO_URL;
        io.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  io.observe(frame);
})();

/* ─── PDF SLIDE VIEWER ───────────────────────── */
(function initSlideViewer() {
  const canvas    = document.getElementById('slideCanvas');
  const loading   = document.getElementById('slideLoading');
  const indicator = document.getElementById('slideIndicator');
  const fill      = document.getElementById('slideProgressFill');
  const btnPrev   = document.getElementById('slidePrev');
  const btnNext   = document.getElementById('slideNext');
  const btnAuto   = document.getElementById('slideAuto');
  const btnZoomOut = document.getElementById('slideZoomOut');
  const btnZoomIn  = document.getElementById('slideZoomIn');
  const zoomLevel  = document.getElementById('slideZoomLevel');
  const btnFs     = document.getElementById('slideFullscreen');
  const autoIcon  = document.getElementById('slideAutoIcon');
  const autoLabel = document.getElementById('slideAutoLabel');
  const zonePrev  = document.getElementById('slideZonePrev');
  const zoneNext  = document.getElementById('slideZoneNext');
  const wrap      = document.getElementById('slideCanvasWrap');
  const card      = document.getElementById('slideViewerCard');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const ZOOM_MIN = 0.75;
  const ZOOM_MAX = 3;
  const ZOOM_FACTOR = 1.2;
  let pdf = null, cur = 1, total = 0, rendering = false, pendingPage = null;
  let pendingZoomRender = false;
  let zoom = 1;
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  let pinchTargetZoom = 1;
  let pinchRaf = 0;
  let autoOn = false, autoTimer = null, autoPaused = false;
  const pageCache = new Map();

  // ── Load PDF.js from CDN ──
  const PDFJS_VER = '3.11.174';
  const s = document.createElement('script');
  s.src = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}/pdf.min.js`;
  s.onload = () => {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VER}/pdf.worker.min.js`;
    loadPDF();
  };
  s.onerror = () => {
    if (loading) loading.innerHTML = '<p style="color:#f87171;padding:20px">Failed to load PDF viewer.</p>';
  };
  document.head.appendChild(s);

  // ── Load & render — pass URL directly so PDF.js uses HTTP range requests ──
  // (fetches only the bytes needed per page, like opening locally)
  function loadPDF() {
    window.pdfjsLib.getDocument(DECK_PDF_PATH).promise
      .then((doc) => {
        pdf   = doc;
        total = doc.numPages;
        pageCache.clear();
        if (loading) { loading.style.display = 'none'; }
        refreshUI();
        renderPage(1);
      })
      .catch(() => {
        if (loading) loading.innerHTML = '<p style="color:#f87171;padding:20px">Could not load deck.pdf — make sure it is in the same folder.</p>';
      });
  }

  const annotLayer = document.getElementById('pdfAnnotLayer');

  function clampZoom(v) {
    return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
  }

  function setZoom(nextZoom, opts = {}) {
    const { stopAutoAdvance = true } = opts;
    const clamped = clampZoom(nextZoom);
    if (Math.abs(clamped - zoom) < 0.001) return;
    zoom = clamped;
    if (stopAutoAdvance) stopAuto();
    if (!pdf) { refreshUI(); return; }
    if (rendering) {
      pendingZoomRender = true;
      refreshUI();
      return;
    }
    renderPage(cur);
  }

  function syncAnnotationLayerPosition() {
    if (!annotLayer || !wrap) return;
    annotLayer.style.left = `${canvas.offsetLeft - wrap.scrollLeft}px`;
    annotLayer.style.top = `${canvas.offsetTop - wrap.scrollTop}px`;
  }

  function getPage(n) {
    if (pageCache.has(n)) return Promise.resolve(pageCache.get(n));
    return pdf.getPage(n).then((page) => {
      pageCache.set(n, page);
      return page;
    });
  }

  function renderPage(n) {
    if (!pdf || n < 1 || n > total) return;
    if (rendering) {
      if (n === cur) pendingZoomRender = true;
      else pendingPage = n;
      return;
    }
    rendering = true;
    pendingZoomRender = false;
    if (annotLayer) annotLayer.innerHTML = '';

    getPage(n).then((page) => {
      const baseVp = page.getViewport({ scale: 1 });
      const isFullscreen = document.fullscreenElement === card;
      const isMobile = window.innerWidth <= 768;
      const wrapW = Math.max(wrap ? wrap.clientWidth : 900, 240);
      const rawWrapH = Math.max(wrap ? wrap.clientHeight : 260, 260);
      // On mobile (non-fullscreen) cap effective height to ~65% of width so
      // landscape PDF slides don't stretch to the full viewport height.
      const wrapH = (isMobile && !isFullscreen)
        ? Math.min(rawWrapH, Math.round(wrapW * 0.65))
        : rawWrapH;
      const fitScaleW = wrapW / baseVp.width;
      const fitScaleH = wrapH / baseVp.height;
      const fitScale = Math.min(fitScaleW, fitScaleH);
      const vp = page.getViewport({ scale: fitScale * zoom });
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(vp.width * dpr));
      canvas.height = Math.max(1, Math.floor(vp.height * dpr));
      canvas.style.width = `${vp.width}px`;
      canvas.style.height = `${vp.height}px`;

      const renderContext = { canvasContext: ctx, viewport: vp };
      if (dpr !== 1) renderContext.transform = [dpr, 0, 0, dpr, 0, 0];

      page.render(renderContext).promise.then(() => {
        cur = n;
        refreshUI();
        addAnnotationLayer(page, vp);
      }).finally(() => {
        rendering = false;
        if (pendingPage !== null) {
          const queued = pendingPage;
          pendingPage = null;
          pendingZoomRender = false; // queued nav render already uses latest zoom
          renderPage(queued);
          return;
        }
        if (pendingZoomRender) {
          pendingZoomRender = false;
          renderPage(cur);
        }
      });
    });
  }

  // Build transparent <a> elements over every PDF link annotation
  function addAnnotationLayer(page, logicalVp) {
    if (!annotLayer) return;
    annotLayer.innerHTML = '';

    // Match CSS display size of canvas (logical pixels)
    const dispW = canvas.clientWidth  || logicalVp.width;
    const dispH = canvas.clientHeight || logicalVp.height;
    annotLayer.style.width  = dispW + 'px';
    annotLayer.style.height = dispH + 'px';
    syncAnnotationLayerPosition();

    page.getAnnotations({ intent: 'display' }).then((annotations) => {
      annotations.forEach((ann) => {
        const url = ann.url || (ann.action && ann.action.url);
        if (!url) return;

        // logicalVp gives positions already in CSS logical pixels — no extra scaling
        const [x1, y1, x2, y2] = logicalVp.convertToViewportRectangle(ann.rect);
        const a = document.createElement('a');
        a.href   = url;
        a.target = '_blank';
        a.rel    = 'noopener noreferrer';
        a.title  = url;
        a.style.left   = Math.min(x1, x2) + 'px';
        a.style.top    = Math.min(y1, y2) + 'px';
        a.style.width  = Math.abs(x2 - x1) + 'px';
        a.style.height = Math.abs(y2 - y1) + 'px';
        annotLayer.appendChild(a);
      });
    });
  }

  function refreshUI() {
    if (indicator) indicator.textContent = `${cur} / ${total}`;
    if (fill)      fill.style.width = `${(cur / total) * 100}%`;
    if (btnPrev)   btnPrev.disabled = cur <= 1;
    if (btnNext)   btnNext.disabled = cur >= total;
    if (btnZoomOut) btnZoomOut.disabled = zoom <= ZOOM_MIN + 0.001;
    if (btnZoomIn)  btnZoomIn.disabled = zoom >= ZOOM_MAX - 0.001;
    if (zoomLevel)  zoomLevel.textContent = `${Math.round(zoom * 100)}%`;
    if (zonePrev)  zonePrev.style.opacity = cur <= 1     ? '0.2' : '';
    if (zoneNext)  zoneNext.style.opacity = cur >= total ? '0.2' : '';
  }

  function go(n) { renderPage(n); }
  function prev() { stopAuto(); go(cur - 1); }
  function next() { stopAuto(); go(cur + 1); }

  // ── Auto-advance ──
  function tick() {
    const nxt = cur < total ? cur + 1 : 1;
    go(nxt);
  }
  function startAuto() {
    autoOn = true;
    autoTimer = setInterval(tick, SLIDE_AUTO_MS);
    if (autoLabel) autoLabel.textContent = 'Pause';
    if (autoIcon)  autoIcon.innerHTML = '<rect x="4" y="3" width="4" height="14" rx="1"/><rect x="12" y="3" width="4" height="14" rx="1"/>';
    if (btnAuto)   btnAuto.classList.add('is-active');
  }
  function stopAuto() {
    autoOn = false;
    clearInterval(autoTimer);
    if (autoLabel) autoLabel.textContent = 'Auto';
    if (autoIcon)  autoIcon.innerHTML = '<path d="M6 4l10 6-10 6V4z"/>';
    if (btnAuto)   btnAuto.classList.remove('is-active');
  }

  // ── Events ──
  if (btnPrev)  btnPrev.addEventListener('click', prev);
  if (btnNext)  btnNext.addEventListener('click', next);
  if (btnZoomOut) btnZoomOut.addEventListener('click', () => setZoom(zoom / ZOOM_FACTOR));
  if (btnZoomIn)  btnZoomIn.addEventListener('click', () => setZoom(zoom * ZOOM_FACTOR));
  if (zonePrev) zonePrev.addEventListener('click', prev);
  if (zoneNext) zoneNext.addEventListener('click', next);
  if (btnAuto)  btnAuto.addEventListener('click', () => autoOn ? stopAuto() : startAuto());

  // ── Fullscreen ──
  const FS_EXPAND   = '<path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4"/>';
  const FS_COLLAPSE = '<path d="M7 3v4H3M17 3v4h-4M3 13h4v4M13 17h4v-4"/>';
  function toggleFullscreen() {
    const fsEl = card || document.getElementById('slideViewerCard');
    if (!fsEl) return;
    if (!document.fullscreenElement) {
      fsEl.requestFullscreen && fsEl.requestFullscreen();
    } else {
      document.exitFullscreen && document.exitFullscreen();
    }
  }
  if (btnFs) btnFs.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', () => {
    const isFs = !!document.fullscreenElement;
    const icon = document.getElementById('slideFsIcon');
    if (icon)  icon.innerHTML = isFs ? FS_COLLAPSE : FS_EXPAND;
    if (btnFs) btnFs.classList.toggle('is-active', isFs);
    // Re-render at new dimensions after a frame
    setTimeout(() => { if (pdf) renderPage(cur); }, 60);
  });

  // Keyboard arrows + Escape
  document.addEventListener('keydown', (e) => {
    if (!pdf) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { stopAuto(); go(cur + 1); }
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { stopAuto(); go(cur - 1); }
    if (e.key === 'f' || e.key === 'F') toggleFullscreen();
  });

  // Pause auto on hover, resume on leave
  if (card) {
    card.addEventListener('mouseenter', () => {
      if (autoOn) { autoPaused = true; clearInterval(autoTimer); }
    });
    card.addEventListener('mouseleave', () => {
      if (autoOn && autoPaused) {
        autoPaused = false;
        autoTimer = setInterval(tick, SLIDE_AUTO_MS);
      }
    });
  }

  function getTouchDistance(t1, t2) {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  if (wrap) {
    wrap.addEventListener('scroll', syncAnnotationLayerPosition, { passive: true });
    wrap.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 2) return;
      pinchStartDist = getTouchDistance(e.touches[0], e.touches[1]);
      pinchStartZoom = zoom;
      pinchTargetZoom = zoom;
    }, { passive: false });

    wrap.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 2 || pinchStartDist <= 0) return;
      e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (!dist) return;
      pinchTargetZoom = clampZoom(pinchStartZoom * (dist / pinchStartDist));
      if (pinchRaf) return;
      pinchRaf = requestAnimationFrame(() => {
        pinchRaf = 0;
        setZoom(pinchTargetZoom, { stopAutoAdvance: false });
      });
    }, { passive: false });

    const endPinch = () => {
      pinchStartDist = 0;
    };
    wrap.addEventListener('touchend', endPinch, { passive: true });
    wrap.addEventListener('touchcancel', endPinch, { passive: true });
  }

  // Re-render on window resize
  window.addEventListener('resize', () => { if (pdf) renderPage(cur); });
})();

/* ─── SMOOTH ANCHOR SCROLL ───────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
