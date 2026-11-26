/* Motion layer for Bazi. Contract: DESIGN.md "Motion system".
   Transform/opacity/filter/clip-path only; reduced motion keeps fades, drops movement. */
(function () {
  const RM = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = () => RM.matches;
  const EASE_OUT = 'cubic-bezier(.23,1,.32,1)', EASE_DRAWER = 'cubic-bezier(.32,.72,0,1)';
  const P = () => (window.Capacitor && window.Capacitor.Plugins) || {};

  /* ---------- haptics ---------- */
  function haptic(kind) {
    const H = P().Haptics;
    try {
      if (H) {
        if (kind === 'error') return H.notification({ type: 'ERROR' });
        if (kind === 'success') return H.notification({ type: 'SUCCESS' });
        if (kind === 'select') return H.selectionChanged ? H.selectionStart().then(() => H.selectionChanged()).then(() => H.selectionEnd()) : H.impact({ style: 'LIGHT' });
        return H.impact({ style: kind === 'heavy' ? 'MEDIUM' : 'LIGHT' });
      }
      if (navigator.vibrate) navigator.vibrate(kind === 'error' ? [12, 40, 12] : kind === 'heavy' ? 18 : 8);
    } catch (e) {}
  }
  // make :active fire on Android touch, and give every pressable a light tick
  document.addEventListener('touchstart', () => {}, { passive: true });
  document.addEventListener('pointerdown', e => {
    if (e.target.closest('button,.seg label,.switch,[role=button],summary')) haptic('light');
  }, { passive: true });

  /* ---------- view transition (direction aware) ---------- */
  function view(dir, apply) {
    document.documentElement.dataset.dir = dir;
    if (document.startViewTransition && !reduced()) {
      const vt = document.startViewTransition(() => apply());
      vt.ready.catch(() => {}); vt.updateCallbackDone.catch(() => {});
      return vt.finished.catch(() => {});
    }
    apply();
    const v = document.querySelector('.view:not([hidden])');
    if (v) { v.classList.remove('enter-f', 'enter-b'); void v.offsetWidth; v.classList.add(dir === 'back' ? 'enter-b' : 'enter-f'); }
    return Promise.resolve();
  }

  /* ---------- error shake ---------- */
  function shake(el) {
    haptic('error');
    if (!el) return;
    const target = el.closest('.field') || el;
    if (reduced()) return;
    target.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(2px)' }, { transform: 'translateX(0)' }],
      { duration: 360, easing: 'ease-in-out' });
  }

  /* ---------- seal stamp on Calculate ---------- */
  function stamp(btn, glyphs) {
    haptic('heavy');
    if (reduced()) return Promise.resolve();
    const s = document.createElement('span');
    s.className = 'stampfx zh'; s.setAttribute('aria-hidden', 'true'); s.innerHTML = (glyphs || '排盘').split('').map(c => '<i>' + c + '</i>').join('');
    btn.appendChild(s);
    btn.classList.add('busy');
    const a = s.animate([
      { transform: 'translate(-50%,-50%) scale(1.9) rotate(-8deg)', opacity: 0, filter: 'blur(3px)' },
      { transform: 'translate(-50%,-50%) scale(.94) rotate(-4deg)', opacity: 1, filter: 'blur(0)', offset: .55 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(-4deg)', opacity: 1, offset: .75 },
      { transform: 'translate(-50%,-50%) scale(1) rotate(-4deg)', opacity: 1 }
    ], { duration: 520, easing: EASE_OUT, fill: 'forwards' });
    btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.97)', offset: .55 }, { transform: 'scale(1)' }], { duration: 520, easing: EASE_OUT });
    return a.finished.then(() => { setTimeout(() => { s.remove(); btn.classList.remove('busy'); }, 400); });
  }

  /* ---------- count up numbers ---------- */
  function countUp(root) {
    root.querySelectorAll('[data-count]').forEach(el => {
      const to = +el.dataset.count, suf = el.dataset.suffix || '';
      if (reduced()) { el.textContent = to + suf; return; }
      const t0 = performance.now(), dur = 700, delay = +(el.dataset.delay || 0);
      el.textContent = '0' + suf;
      const step = now => {
        const p = Math.min(1, Math.max(0, (now - t0 - delay) / dur)), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(to * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- scroll reveal (once) ---------- */
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
    if (en.isIntersecting) { en.target.classList.add('seen'); io.unobserve(en.target); if (en.target.dataset.onseen) countUp(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 }) : null;
  function reveal(nodes) {
    nodes.forEach(n => { n.classList.remove('seen'); n.classList.add('rv'); if (io) io.observe(n); else n.classList.add('seen'); });
  }

  /* ---------- animated <details> ---------- */
  function details(d) {
    const sum = d.querySelector('summary');
    const body = document.createElement('div'); body.className = 'adv-body';
    const inner = document.createElement('div'); inner.className = 'adv-inner';
    [...d.children].filter(c => c !== sum).forEach(c => inner.appendChild(c));
    body.appendChild(inner); d.appendChild(body);
    if (d.open) d.classList.add('is-open');
    sum.addEventListener('click', e => {
      e.preventDefault();
      if (!d.open) { d.open = true; requestAnimationFrame(() => requestAnimationFrame(() => d.classList.add('is-open'))); }
      else {
        d.classList.remove('is-open');
        const done = () => { if (!d.classList.contains('is-open')) d.open = false; };
        if (reduced()) done(); else body.addEventListener('transitionend', done, { once: true });
        setTimeout(done, 400);
      }
    });
    // programmatic open (validation) keeps class in sync
    new MutationObserver(() => { if (d.open && !d.classList.contains('is-open')) requestAnimationFrame(() => d.classList.add('is-open')); }).observe(d, { attributes: true, attributeFilter: ['open'] });
  }

  /* ---------- language crossfade ---------- */
  function swap(apply) {
    if (reduced()) { apply(); return; }
    const m = document.querySelector('main');
    m.classList.add('swapping');
    setTimeout(() => { apply(); requestAnimationFrame(() => m.classList.remove('swapping')); }, 150);
  }

  /* ---------- list item enter / exit ---------- */
  function listEnter(li) { if (!li || reduced()) return; li.animate([{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: EASE_OUT }); }
  function listExit(li) {
    if (!li || reduced()) return Promise.resolve();
    const h = li.offsetHeight;
    return li.animate([{ opacity: 1, transform: 'none', height: h + 'px' }, { opacity: 0, transform: 'translateX(24px)', height: h + 'px', offset: .55 }, { opacity: 0, transform: 'translateX(24px)', height: '0px' }],
      { duration: 300, easing: EASE_OUT, fill: 'forwards' }).finished;
  }

  /* ---------- bottom sheet with drag / flick to dismiss ---------- */
  let sheet, scrim, body, lastFocus = null, isOpen = false;
  function buildSheet() {
    scrim = document.createElement('div'); scrim.className = 'scrim';
    sheet = document.createElement('div'); sheet.className = 'sheet'; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.tabIndex = -1;
    sheet.innerHTML = '<div class="grab" aria-hidden="true"><i></i></div><div class="sheet-body"></div>';
    body = sheet.querySelector('.sheet-body');
    document.body.append(scrim, sheet);
    scrim.addEventListener('click', () => close());
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) close(); });

    // drag
    let y0 = 0, t0 = 0, dy = 0, drag = false, pid = null;
    sheet.addEventListener('pointerdown', e => {
      if (drag) return;                                    // ignore extra fingers
      const onGrab = e.target.closest('.grab,.sh-head');
      if (!onGrab && body.scrollTop > 0) return;           // let content scroll
      drag = true; pid = e.pointerId; y0 = e.clientY; t0 = performance.now(); dy = 0;
      sheet.style.transition = 'none';
    });
    sheet.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== pid) return;
      dy = e.clientY - y0;
      if (Math.abs(dy) > 4 && !sheet.hasPointerCapture(pid)) sheet.setPointerCapture(pid);
      const y = dy > 0 ? dy : -Math.sqrt(-dy) * 2;          // friction when pulling up
      sheet.style.transform = `translateY(${y}px)`;
      scrim.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / sheet.offsetHeight));
    });
    const end = e => {
      if (!drag || (e && e.pointerId !== pid)) return;
      drag = false;
      const v = dy / Math.max(1, performance.now() - t0);
      sheet.style.transition = ''; scrim.style.opacity = '';
      if (dy > sheet.offsetHeight * .28 || (v > .11 && dy > 12)) close();
      else sheet.style.transform = '';
    };
    sheet.addEventListener('pointerup', end); sheet.addEventListener('pointercancel', end);
  }
  let restoreFocus = false;
  function open(html, from, viaKeyboard) {
    restoreFocus = !!viaKeyboard;
    if (!sheet) buildSheet();
    body.innerHTML = html; body.scrollTop = 0;
    lastFocus = from || document.activeElement;
    sheet.style.transform = '';
    document.documentElement.classList.add('sheet-open');
    isOpen = true; haptic('select');
    requestAnimationFrame(() => { sheet.classList.add('open'); scrim.classList.add('open'); sheet.focus({ preventScroll: true }); });
    if (!reduced()) body.querySelectorAll('.sh-row').forEach((r, i) => r.style.setProperty('--i', i));
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    sheet.style.transform = '';
    sheet.classList.remove('open'); scrim.classList.remove('open');
    document.documentElement.classList.remove('sheet-open');
    if (restoreFocus && lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    else if (document.activeElement && sheet.contains(document.activeElement)) document.activeElement.blur();
  }

  /* ---------- element spotlight ---------- */
  function spotlight(root, cls, btn) {
    const same = root.dataset.spot === cls;
    root.querySelectorAll('[data-e].on').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
    if (same) { delete root.dataset.spot; return; }
    root.dataset.spot = cls; haptic('select');
    if (btn) { btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true'); }
  }

  window.Motion = { reduced, haptic, view, shake, stamp, countUp, reveal, details, swap, listEnter, listExit, sheet: { open, close, isOpen: () => isOpen }, spotlight };
})();
