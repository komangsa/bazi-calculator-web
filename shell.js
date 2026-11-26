/* Shell: navigation, welcome, guided tour, coach marks, home menu,
   in-depth analysis panel, couple match. Loads after app.js. */
(function () {
  const $ = s => document.querySelector(s);
  const A = window.BaziApp, AN = window.BaziAnalysis, M = window.Motion;
  const S = Bazi.STEMS, BR = Bazi.BRANCHES, ECLS = ['w', 'f', 'e', 'm', 's'], EL_CH = ['木', '火', '土', '金', '水'];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ch = (c, e, cls = '') => `<span class="ch ${ECLS[e]} ${cls}">${c}</span>`;

  /* ================= strings ================= */
  window.EXTRA_T = {
    id: {
      wTitle: 'Peta hidup dalam empat pilar', wSub: 'Bazi dengan perhitungan astronomis, analisis karier, tahun baik dan buruk, serta kecocokan pasangan.',
      wStart: 'Mulai', wSkip: 'Lewati panduan',
      homeTitle: 'Mau membaca apa?', homeSub: 'Bagan diri sendiri, atau cocokkan dua orang.',
      todayL: 'Hari ini', todayNote: (gz, el, yy, an, clashAn, clashZh) => `Hari ${gz}: ${el} ${yy} di atas ${an}. Bertabrakan (冲) dengan shio ${clashAn} (${clashZh}).`,
      mSelf: 'Bazi diri sendiri', mSelfSub: 'Empat pilar, karier, tahun baik dan buruk', mCouple: 'Kecocokan pasangan', mCoupleSub: 'Dua bagan dicocokkan menurut tradisi 合婚', mTour: 'Panduan singkat',
      anaTitle: 'Analisis mendalam', tabs: ['Ringkas', 'Karier', 'Tahun', 'Asmara', 'Sehat'],
      factors: 'Tiga ukuran kekuatan', structure: 'Struktur bagan (格局)', useful: 'Elemen pendukung (用神)', avoid: 'Elemen dihindari (忌神)',
      natal: 'Interaksi dalam bagan', stars: 'Bintang khusus (神煞)', persona: 'Komposisi Ten Gods', careerWho: 'Arah karier', combos: 'Pola klasik',
      fields: 'Bidang yang sejalan', wealthT: 'Keuangan', bestYears: 'Tahun terbaik', worstYears: 'Tahun terberat', yearList: 'Penilaian per tahun',
      luckList: 'Penilaian pilar keberuntungan', tapYear: 'Ketuk tahun untuk melihat semua alasannya.', none: 'Tidak ada yang menonjol.', theme: 'Sisi baik', risk: 'Yang perlu diwaspadai', dominant: 'lebih dominan tahun ini',
      reasons: 'Alasan penilaian', score: 'Skor', current: 'Sekarang', loveT: 'Asmara dan pernikahan', healthT: 'Kesehatan', ageW: 'usia', noTimeNote: 'Jam lahir tidak diketahui: analisis memakai tiga pilar, sebagian detail bisa kurang tepat.',
      tour: [
        ['Empat pilar kelahiran', 'Tahun, bulan, hari, dan jam lahir masing-masing menjadi satu pilar: batang langit di atas, cabang bumi di bawah.'],
        ['Lima elemen', 'Kayu, Api, Tanah, Logam, dan Air saling menghidupi dan mengendalikan. Keseimbangannya menentukan elemen pendukungmu.'],
        ['Karier dan tahun', 'Analisis membaca struktur bagan dan bintang khusus, lalu menilai setiap tahun: mana yang mendukung, mana yang perlu diwaspadai.'],
        ['Kecocokan pasangan', 'Bandingkan Day Master, istana pasangan, shio, dan elemen pendukung dua orang menurut tradisi 合婚.']
      ],
      tourNext: 'Lanjut', tourDone: 'Mulai sekarang', tourSkip: 'Lewati',
      coach: ['Ketuk pilar mana pun untuk melihat detailnya.', 'Ketuk elemen untuk menyorotnya di seluruh bagan.', 'Buka tab analisis: karier, tahun baik dan buruk, asmara, dan kesehatan.'],
      coachNext: 'Lanjut', coachDone: 'Mengerti',
      cTitle: 'Kecocokan pasangan', cSub: 'Masukkan data lahir dua orang.', pA: 'Kamu', pB: 'Pasangan', cCalc: 'Hitung kecocokan', useMine: 'Isi dari bagan terakhir',
      mScore: 'Skor kecocokan', mBreak: 'Rincian penilaian', mNotes: 'Catatan', mPillars: 'Empat pilar',
      grp: { dm: 'Day Master', palace: 'Istana pasangan (cabang hari)', zodiac: 'Shio (cabang tahun)', family: 'Keluarga (cabang bulan)', element: 'Elemen pendukung' },
      mDisc: 'Skor memakai aturan 合婚 tradisional. Hubungan nyata tetap ditentukan oleh komunikasi dan pilihan kedua orang.', noFactor: 'Tidak ada interaksi khusus.'
    },
    en: {
      wTitle: 'A life map in four pillars', wSub: 'Bazi with astronomical calculation, career analysis, good and bad years, and couple compatibility.',
      wStart: 'Get started', wSkip: 'Skip the guide',
      homeTitle: 'What would you like to read?', homeSub: 'Your own chart, or match two people.',
      todayL: 'Today', todayNote: (gz, el, yy, an, clashAn, clashZh) => `A ${gz} day: ${yy} ${el} over the ${an}. It clashes (冲) with the ${clashAn} (${clashZh}).`,
      mSelf: 'My Bazi', mSelfSub: 'Four pillars, career, good and bad years', mCouple: 'Couple match', mCoupleSub: 'Two charts matched by 合婚 tradition', mTour: 'Quick guide',
      anaTitle: 'In-depth analysis', tabs: ['Basics', 'Career', 'Years', 'Love', 'Health'],
      factors: 'Three measures of strength', structure: 'Chart structure (格局)', useful: 'Favourable elements (用神)', avoid: 'Elements to avoid (忌神)',
      natal: 'Interactions in the chart', stars: 'Special stars (神煞)', persona: 'Ten God composition', careerWho: 'Career direction', combos: 'Classical patterns',
      fields: 'Aligned fields', wealthT: 'Finances', bestYears: 'Best years', worstYears: 'Hardest years', yearList: 'Year by year',
      luckList: 'Luck pillar ratings', tapYear: 'Tap a year to see every reason.', none: 'Nothing notable.', theme: 'Upside', risk: 'Watch out for', dominant: 'stronger this year',
      reasons: 'Why this rating', score: 'Score', current: 'Now', loveT: 'Love and marriage', healthT: 'Health', ageW: 'age', noTimeNote: 'Birth time unknown: the analysis uses three pillars, so some details may be off.',
      tour: [
        ['Four pillars of birth', 'The year, month, day, and hour of birth each form a pillar: a heavenly stem on top, an earthly branch below.'],
        ['Five elements', 'Wood, Fire, Earth, Metal, and Water feed and control each other. Their balance sets your favourable elements.'],
        ['Career and years', 'The analysis reads the chart structure and special stars, then rates each year: which ones support you and which need care.'],
        ['Couple match', 'Compare two people\'s Day Masters, spouse palaces, zodiac signs, and favourable elements by 合婚 tradition.']
      ],
      tourNext: 'Next', tourDone: 'Start now', tourSkip: 'Skip',
      coach: ['Tap any pillar to see its details.', 'Tap an element to spotlight it across the chart.', 'Open the analysis tabs: career, good and bad years, love, and health.'],
      coachNext: 'Next', coachDone: 'Got it',
      cTitle: 'Couple match', cSub: 'Enter the birth details of two people.', pA: 'You', pB: 'Partner', cCalc: 'Calculate match', useMine: 'Fill from my last chart',
      mScore: 'Match score', mBreak: 'Score breakdown', mNotes: 'Notes', mPillars: 'Four pillars',
      grp: { dm: 'Day Master', palace: 'Spouse palace (day branch)', zodiac: 'Zodiac (year branch)', family: 'Family (month branch)', element: 'Favourable elements' },
      mDisc: 'Scored with traditional 合婚 rules. A real relationship is still shaped by communication and the choices of both people.', noFactor: 'No special interaction.'
    }
  };
  const X = () => window.EXTRA_T[A.lang()];

  /* ================= navigation ================= */
  const Nav = window.Nav = {
    stack: [],
    go(id, after, root) {
      let dir = 'fwd';
      if (root) { dir = this.stack.length ? 'back' : 'fwd'; this.stack = [id]; }
      else { const i = this.stack.indexOf(id); if (i >= 0) { this.stack = this.stack.slice(0, i + 1); dir = 'back'; } else this.stack.push(id); }
      return this._show(id, dir, after);
    },
    back() { if (this.stack.length <= 1) return false; this.stack.pop(); this._show(this.stack[this.stack.length - 1], 'back'); return true; },
    _show(id, dir, after) {
      M.sheet.close(); Coach.close();
      const run = this.booted ? (fn => M.view(dir, fn)) : (fn => { this.booted = true; fn(); return Promise.resolve(); });
      return run(() => {
        document.querySelectorAll('main > .view').forEach(v => { v.hidden = v.id !== id; });
        $('#back').hidden = this.stack.length <= 1;
        document.body.dataset.view = id;
        window.scrollTo(0, 0);
        if (after) after();
        if (id === 'welcomeView') playWelcome();
        if (id === 'homeView') renderToday();
      });
    }
  };
  $('#back').onclick = () => Nav.back();

  /* ================= welcome ================= */
  function trigramRing() {
    const bits = [[1, 1, 1], [1, 1, 0], [1, 0, 1], [1, 0, 0], [0, 0, 0], [0, 0, 1], [0, 1, 0], [0, 1, 1]]; // 先天: 乾兑离震 坤艮坎巽
    let g = '';
    bits.forEach((tri, k) => {
      const rot = k * 45;
      tri.forEach((b, j) => {
        const y = -78 - j * 7;
        g += b ? `<rect x="-11" y="${y}" width="22" height="3.6" rx="1" transform="rotate(${rot})"/>`
          : `<rect x="-11" y="${y}" width="9" height="3.6" rx="1" transform="rotate(${rot})"/><rect x="2" y="${y}" width="9" height="3.6" rx="1" transform="rotate(${rot})"/>`;
      });
    });
    return `<g class="tri" transform="translate(100 100)">${g}</g>`;
  }
  $('#wArt').innerHTML = `<svg class="w-svg" viewBox="0 0 200 200" aria-hidden="true">${trigramRing()}
    <path class="enso" d="M100 38c36 0 60 26 60 60 0 36-27 63-61 63-35 0-62-27-62-61 0-27 16-48 41-57" pathLength="1"/></svg>
    <span class="w-seal zh" aria-hidden="true"><i>八</i><i>字</i></span>`;
  function playWelcome() {
    const w = $('#welcomeView'); w.classList.remove('play'); void w.offsetWidth; w.classList.add('play');
  }
  $('#wStart').onclick = () => Tour.open(true);
  $('#wSkip').onclick = () => finishOnboarding();
  function finishOnboarding() { A.store.set('bz_onboarded', 1); Nav.go('homeView', null, true); }

  /* ================= guided tour ================= */
  const Tour = window.Tour = (() => {
    let el, track, idx = 0, open = false, fromWelcome = false;
    const ILL = [
      () => `<div class="ill ill-pillars">${[['甲', 0, '子', 4], ['丙', 1, '寅', 0], ['戊', 2, '午', 1], ['庚', 3, '申', 3]].map((c, i) => `<div class="ip" style="--i:${i}">${ch(c[0], c[1])}${ch(c[2], c[3])}</div>`).join('')}</div>`,
      () => {
        // generating cycle as ONE continuous stroke (constant speed), nodes light up as the stroke reaches them,
        // then the controlling star draws through. Nodes sit in an outer translate <g> so CSS scale never fights the SVG transform.
        const C = 110, R = 78, pos = [0, 1, 2, 3, 4].map(k => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return [C + R * Math.cos(a), C + R * Math.sin(a)]; });
        const ring = `M${C} ${C - R} A${R} ${R} 0 1 1 ${C} ${C + R} A${R} ${R} 0 1 1 ${C} ${C - R}`;
        const star = `M${[0, 2, 4, 1, 3].map(k => pos[k].map(v => v.toFixed(2)).join(' ')).join(' L')} Z`;
        const nodes = pos.map((p, k) => `<g transform="translate(${p[0].toFixed(2)} ${p[1].toFixed(2)})"><g class="node" style="--i:${k}"><circle r="21"/><text class="zh ${ECLS[k]}" dy="7">${EL_CH[k]}</text></g></g>`).join('');
        return `<div class="ill"><svg class="ill-wx" viewBox="0 0 220 220"><path class="ctl" d="${star}" pathLength="1"/><path class="gen" d="${ring}" pathLength="1"/>${nodes}</svg></div>`;
      },
      () => `<div class="ill ill-bars"><div class="ib-axis" aria-hidden="true"></div>${[2.5, 4, -2, 1, -3.5, 3, 0.5, -1].map((v, i) => `<div class="ib" style="--i:${i}"><i class="${v >= 0 ? 'up' : 'dn'}" style="--h:${Math.abs(v) / 4 * 46}px"></i><small>${new Date().getFullYear() + i}</small></div>`).join('')}</div>`,
      () => `<div class="ill ill-match"><span class="ms l zh">甲</span><span class="ms r zh">己</span><span class="mh zh">合</span></div>`
    ];
    function build() {
      el = document.createElement('div'); el.className = 'tour'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
      el.innerHTML = `<div class="tour-top"><button type="button" class="ghost t-skip"></button></div>
        <div class="tour-vp"><div class="tour-track"></div></div>
        <div class="tour-foot"><div class="dots" role="tablist"></div><button type="button" class="primary t-next"></button></div>`;
      document.body.appendChild(el);
      track = el.querySelector('.tour-track');
      el.querySelector('.t-skip').onclick = () => close(true);
      el.querySelector('.t-next').onclick = () => idx < 3 ? go(idx + 1) : close(true);
      el.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(Math.min(3, idx + 1)); if (e.key === 'ArrowLeft') go(Math.max(0, idx - 1)); if (e.key === 'Escape') close(true); });
      // swipe
      const vp = el.querySelector('.tour-vp');
      let x0 = 0, t0 = 0, dx = 0, drag = false, pid;
      vp.addEventListener('pointerdown', e => { drag = true; pid = e.pointerId; x0 = e.clientX; t0 = performance.now(); dx = 0; track.style.transition = 'none'; });
      vp.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== pid) return;
        dx = e.clientX - x0; if (Math.abs(dx) > 6 && !vp.hasPointerCapture(pid)) vp.setPointerCapture(pid);
        const edge = (idx === 0 && dx > 0) || (idx === 3 && dx < 0);
        track.style.transform = `translateX(calc(${-idx * 100}% + ${edge ? dx / 3 : dx}px))`;
      });
      const end = e => {
        if (!drag || e.pointerId !== pid) return; drag = false; track.style.transition = '';
        const v = dx / Math.max(1, performance.now() - t0), w = vp.offsetWidth;
        if ((dx < -w * .2 || v < -.35) && idx < 3) go(idx + 1); else if ((dx > w * .2 || v > .35) && idx > 0) go(idx - 1); else go(idx);
      };
      vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
    }
    function texts() {
      const x = X();
      track.innerHTML = x.tour.map((s, i) => `<section class="tslide" aria-hidden="${i !== idx}">${ILL[i]()}<h2>${s[0]}</h2><p>${s[1]}</p></section>`).join('');
      el.querySelector('.dots').innerHTML = x.tour.map((s, i) => `<button type="button" role="tab" aria-label="${i + 1}" data-d="${i}"></button>`).join('');
      el.querySelectorAll('.dots button').forEach(b => b.onclick = () => go(+b.dataset.d));
      el.querySelector('.t-skip').textContent = x.tourSkip;
      mark();
    }
    function mark() {
      const x = X();
      track.style.transform = `translateX(${-idx * 100}%)`;
      el.querySelectorAll('.tslide').forEach((s, i) => { s.setAttribute('aria-hidden', i !== idx); s.classList.remove('on'); if (i === idx) { void s.offsetWidth; s.classList.add('on'); } });
      el.querySelectorAll('.dots button').forEach((d, i) => d.classList.toggle('on', i === idx));
      el.querySelector('.t-next').textContent = idx === 3 ? x.tourDone : x.tourNext;
    }
    function go(i) { if (i !== idx) M.haptic('select'); idx = i; mark(); }
    function openT(welcome) {
      if (!el) build();
      fromWelcome = !!welcome; idx = 0; texts(); open = true;
      el.classList.remove('out'); el.hidden = false;
      requestAnimationFrame(() => el.classList.add('in'));
      setTimeout(() => el.querySelector('.t-next').focus({ preventScroll: true }), 50);
    }
    function close(done) {
      if (!open) return; open = false;
      el.classList.remove('in'); el.classList.add('out');
      setTimeout(() => { el.hidden = true; }, M.reduced() ? 0 : 320);
      if (done && fromWelcome) finishOnboarding();
    }
    return { open: openT, close, isOpen: () => open, refresh: () => open && texts() };
  })();

  /* ================= coach marks ================= */
  const Coach = window.Coach = (() => {
    let el, hole, tip, steps = [], k = 0, on = false;
    function build() {
      el = document.createElement('div'); el.className = 'coach'; el.hidden = true;
      el.innerHTML = '<div class="coach-hole"></div><div class="coach-tip" role="dialog" aria-live="polite"><p></p><div class="coach-row"><span class="coach-n"></span><button type="button" class="primary coach-btn"></button></div></div>';
      document.body.appendChild(el);
      hole = el.querySelector('.coach-hole'); tip = el.querySelector('.coach-tip');
      el.querySelector('.coach-btn').onclick = () => next();
      el.addEventListener('click', e => { if (e.target === el) next(); });
    }
    function place() {
      const t = $(steps[k]); if (!t) return next();
      const r = t.getBoundingClientRect(), pad = 8;
      hole.style.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`;
      hole.style.width = r.width + pad * 2 + 'px'; hole.style.height = r.height + pad * 2 + 'px';
      const below = r.bottom + 180 < innerHeight;
      tip.style.top = below ? (r.bottom + 18) + 'px' : ''; tip.style.bottom = below ? '' : (innerHeight - r.top + 18) + 'px';
      tip.classList.remove('pop'); void tip.offsetWidth; tip.classList.add('pop');
    }
    function show() {
      const x = X(), t = $(steps[k]);
      tip.querySelector('p').textContent = x.coach[k];
      tip.querySelector('.coach-n').textContent = `${k + 1} / ${steps.length}`;
      tip.querySelector('.coach-btn').textContent = k === steps.length - 1 ? x.coachDone : x.coachNext;
      t.scrollIntoView({ block: 'center', behavior: M.reduced() ? 'auto' : 'smooth' });
      setTimeout(place, M.reduced() ? 0 : 420);
    }
    function next() { k++; if (k >= steps.length) close(); else { M.haptic('select'); show(); } }
    function start(list) {
      if (!el) build();
      steps = list; k = 0; on = true; el.hidden = false;
      requestAnimationFrame(() => el.classList.add('in'));
      show();
    }
    function close() {
      if (!on) return; on = false; A.store.set('bz_coach', 1);
      el.classList.remove('in'); setTimeout(() => { el.hidden = true; }, 260);
      window.scrollTo({ top: 0, behavior: M.reduced() ? 'auto' : 'smooth' });
    }
    addEventListener('resize', () => on && place());
    return { start, close, isOpen: () => on };
  })();

  /* ================= home ================= */
  $('#goSelf').onclick = () => Nav.go('formView');
  $('#goCouple').onclick = () => { fillCoupleDefaults(); Nav.go('coupleView'); };
  $('#goTour').onclick = () => Tour.open(false);

  /* today's almanac: the four pillars of this moment, plus the day's clash (冲) */
  function renderToday() {
    const n = new Date(), L = A.t(), x = X();
    let r;
    try { r = Bazi.calc({ year: n.getFullYear(), month: n.getMonth() + 1, day: n.getDate(), hour: n.getHours(), minute: n.getMinutes(), tz: -n.getTimezoneOffset() / 60, gender: 'M', lateZi: true }); }
    catch (e) { $('#today').hidden = true; return; }
    const KEY = { year: '年', month: '月', day: '日', hour: '时' };
    const day = r.pillars.find(p => p.key === 'day'), clash = (day.b + 6) % 12, de = Bazi.elOf(day.s);
    const date = n.toLocaleDateString(A.lang() === 'id' ? 'id-ID' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    $('#today').innerHTML = `<div class="td-head"><span class="td-l"><span class="zh">今日</span>${x.todayL}</span><span class="td-d">${date}</span></div>
      <div class="td-p">${r.pillars.slice().reverse().map(p => `<div class="${p.key === 'day' ? 'me' : ''}"><small class="zh">${KEY[p.key]}</small>${ch(S[p.s], Bazi.elOf(p.s))}${ch(BR[p.b], Bazi.brEl(p.b))}</div>`).join('')}</div>
      <p class="td-note">${x.todayNote(S[day.s] + BR[day.b], L.el[de], day.s % 2 ? L.yin : L.yang, L.animals[day.b], L.animals[clash], BR[clash])}</p>`;
  }
  clearInterval(renderToday.t); renderToday.t = setInterval(() => { if (!$('#homeView').hidden) renderToday(); }, 60000);

  /* ================= in-depth analysis ================= */
  let anaTab = 0, anaData = null, anaCtx = null;
  const elTag = e => `<span class="etag ${ECLS[e]}">${ch(EL_CH[e], e)}${AN.T[A.lang()].el[e]}</span>`;
  const yearChips = (ys, tone) => ys.length ? `<div class="ychips">${ys.map(y => `<button type="button" class="ychip ${tone}" data-y="${y}">${y}</button>`).join('')}</div>` : `<p class="muted">${X().none}</p>`;
  const lines = arr => arr.map(t => `<p class="aline">${t}</p>`).join('');
  const card = (zh, name, text, tone = 0) => `<div class="acard ${tone < 0 ? 'neg' : tone > 0 ? 'pos' : ''}"><div class="ah"><b class="zh">${zh}</b><span>${name}</span></div><p>${text}</p></div>`;

  function panel(i) {
    const a = anaData, x = X(), L = A.t();
    if (i === 0) {
      const s = a.summary;
      return `<p class="lead">${s.line}</p>
        ${anaCtx.d.noTime ? `<p class="warn">${x.noTimeNote}</p>` : ''}
        <h3>${x.factors}</h3><div class="facts">${s.factors.map((f, j) => `<div class="fact ${f.ok ? 'ok' : 'no'}" style="--i:${j}"><b class="zh">${f.zh}</b><span>${f.text}</span><i aria-hidden="true">${f.ok ? '✓' : '✕'}</i></div>`).join('')}</div>
        <h3>${x.structure}</h3>${card(s.struct.zh, s.struct.name, s.struct.text)}
        <h3>${x.useful}</h3><div class="etags">${s.fav.map(elTag).join('')}</div>
        ${s.unfav.length ? `<h3>${x.avoid}</h3><div class="etags">${s.unfav.map(elTag).join('')}</div>` : ''}
        ${s.climate ? `<p class="aline note">${s.climate}</p>` : ''}
        <h3>${x.persona}</h3><div class="gbars">${a.personality.groups.map((g, j) => `<div class="gb" style="--i:${j}"><span>${g.name}</span><i><b style="--w:${g.pct}%"></b></i><em data-count="${g.pct}" data-suffix="%">${g.pct}%</em></div>`).join('')}</div>
        ${lines(a.personality.lines)}
        <h3>${x.natal}</h3>${a.natal.length ? a.natal.map(n => card(n.zh, '', n.text, n.tone)).join('') : `<p class="muted">${x.none}</p>`}
        <h3>${x.stars}</h3>${a.stars.length ? a.stars.map(s2 => card(s2.zh, `${s2.name}, ${s2.at}`, s2.text)).join('') : `<p class="muted">${x.none}</p>`}`;
    }
    if (i === 1) {
      const c = a.career;
      return `<h3>${x.careerWho}</h3><p class="lead">${c.who}</p>
        <h3>${x.structure}</h3>${card(a.summary.struct.zh, a.summary.struct.name, a.summary.struct.text)}
        <h3>${x.combos}</h3>${c.combos.length ? c.combos.map(k => card(k.zh, k.name, k.text, k.tone)).join('') : `<p class="muted">${x.none}</p>`}
        <h3>${x.fields}</h3>${c.fields.map(f => `<div class="field-row">${elTag(f.e)}<p>${f.text}</p></div>`).join('')}
        ${c.stars.length ? c.stars.map(s2 => card(s2.zh, `${s2.name}, ${s2.at}`, s2.text)).join('') : ''}
        <h3>${c.yearsLabel}</h3>${yearChips(c.years, 'good')}
        <h3>${x.wealthT}</h3>${lines(a.wealth.lines)}
        <h3>${a.wealth.yearsLabel}</h3>${yearChips(a.wealth.years, 'good')}`;
    }
    if (i === 2) {
      const cy = new Date().getFullYear();
      return `<div class="bw"><div><h3>${x.bestYears}</h3>${yearChips(a.best, 'good')}</div><div><h3>${x.worstYears}</h3>${yearChips(a.worst, 'bad')}</div></div>
        <h3>${x.yearList}</h3><p class="muted">${x.tapYear}</p>
        <div class="ylist">${a.years.map((y, j) => {
          const w = Math.min(1, Math.abs(y.score) / 6) * 50;
          return `<button type="button" class="yrow r${y.rating} ${y.y === cy ? 'now' : ''}" data-y="${y.y}" style="--i:${j}">
            <span class="yy">${y.y}</span><span class="yg">${ch(S[y.s], Bazi.elOf(y.s))}${ch(BR[y.b], Bazi.brEl(y.b))}</span>
            <span class="ybar"><i class="${y.score >= 0 ? 'p' : 'n'}" style="--w:${w}%"></i></span>
            <span class="yr"><b class="zh">${y.zh}</b>${y.label}</span></button>`;
        }).join('')}</div>
        <h3>${x.luckList}</h3>
        <div class="llist">${a.luck.map((l, j) => `<div class="lrow r${l.rating}" style="--i:${j}"><span class="yg">${ch(S[l.s], Bazi.elOf(l.s))}${ch(BR[l.b], Bazi.brEl(l.b))}</span><span class="lt"><b>${l.year} - ${l.year + 9}</b><small>${x.ageW} ${l.age} · ${l.theme}</small></span><span class="yr"><b class="zh">${l.zh}</b>${l.label}</span></div>`).join('')}</div>`;
    }
    if (i === 3) return `<h3>${x.loveT}</h3>${lines(a.love.lines)}<h3>${a.love.yearsLabel}</h3>${yearChips(a.love.years, 'love')}`;
    return `<h3>${x.healthT}</h3>${lines(a.health.lines)}<p class="aline note">${a.health.note}</p>`;
  }

  function showPanel(i, animate) {
    const body = $('#anaBody'), prev = anaTab; anaTab = i;
    document.querySelectorAll('#anaTabs [role=tab]').forEach((t, j) => { t.setAttribute('aria-selected', j === i); t.tabIndex = j === i ? 0 : -1; });
    moveInk();
    body.innerHTML = panel(i);
    body.classList.remove('play'); void body.offsetWidth; body.classList.add('play');
    M.countUp(body);
    if (animate && !M.reduced() && prev !== i) body.animate([{ opacity: 0, transform: `translateX(${i > prev ? 18 : -18}px)` }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'cubic-bezier(.23,1,.32,1)' });
  }
  function moveInk() {
    const t = document.querySelector(`#anaTabs [aria-selected=true]`), ink = $('#anaInk'); if (!t || !ink) return;
    ink.style.width = t.offsetWidth + 'px'; ink.style.transform = `translateX(${t.offsetLeft}px)`;
    const bar = $('#anaTabs'); if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: t.offsetLeft - 24, behavior: 'smooth' });
  }
  addEventListener('resize', moveInk);

  window.renderAnalysis = (r, d, animate) => {
    anaCtx = { r, d };
    anaData = AN.analyze(r, d, A.lang(), new Date().getFullYear());
    const x = X();
    $('#anaTabs').innerHTML = x.tabs.map((t, i) => `<button type="button" role="tab" aria-selected="${i === anaTab}" data-t="${i}">${t}</button>`).join('') + '<span class="ink" id="anaInk"></span>';
    if (animate) anaTab = 0;
    showPanel(anaTab, false);
    if (animate && !A.store.get('bz_coach', 0)) setTimeout(() => { if (!$('#resView').hidden) Coach.start(['#chart', '#legend', '#anaTabs']); }, M.reduced() ? 300 : 1900);
  };
  $('#anaTabs').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b) { M.haptic('select'); showPanel(+b.dataset.t, true); } });
  $('#anaTabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const n = (anaTab + (e.key === 'ArrowRight' ? 1 : 4)) % 5; showPanel(n, true); document.querySelector(`#anaTabs [data-t="${n}"]`).focus();
  });
  function yearSheet(y) {
    const yi = anaData.years.find(v => v.y === y) || AN.analyze(anaCtx.r, anaCtx.d, A.lang(), y).years.find(v => v.y === y);
    const x = X(), L = A.t();
    const html = `<div class="sh-head"><div class="sh-glyphs">${ch(S[yi.s], Bazi.elOf(yi.s))}${ch(BR[yi.b], Bazi.brEl(yi.b))}</div><div><h3>${y} · ${yi.label}</h3><p><span class="zh">${yi.zh}</span>, ${x.score} ${yi.score > 0 ? '+' : ''}${yi.score}. ${L.gods[yi.god]} (${Bazi.GODS_ZH[yi.god]})</p></div></div>
      <div class="sh-row ${yi.lean === 'up' ? 'lean' : ''}"><span class="sh-l">${x.theme}${yi.lean === 'up' ? ` · ${x.dominant}` : ''}</span><div class="sh-v"><p>${yi.theme}</p></div></div>
      <div class="sh-row ${yi.lean === 'down' ? 'lean neg' : ''}"><span class="sh-l">${x.risk}${yi.lean === 'down' ? ` · ${x.dominant}` : ''}</span><div class="sh-v"><p>${yi.risk}</p></div></div>
      <div class="sh-row"><span class="sh-l">${x.reasons}</span><ul class="reasons">${yi.reasons.map(rr => `<li class="${rr.v > 0 ? 'p' : rr.v < 0 ? 'n' : ''}"><b>${rr.v > 0 ? '+' + rr.v : rr.v < 0 ? rr.v : '·'}</b><span>${rr.t}</span></li>`).join('')}</ul></div>`;
    M.sheet.open(html + `<button type="button" class="ghost sh-close">${L.close}</button>`);
  }
  $('#anaBody').addEventListener('click', e => { const b = e.target.closest('[data-y]'); if (b) yearSheet(+b.dataset.y); });

  /* ================= couple match ================= */
  function personForm(p) {
    return `<fieldset class="pcard" data-p="${p}"><legend><span class="pdot ${p}"></span><span data-i="p${p}"></span></legend>
      <div class="field"><label for="${p}name" data-i="name"></label><input type="text" id="${p}name" maxlength="40" data-ph="namePh"></div>
      <div class="row2 grid2"><div class="field"><label for="${p}date" data-i="date"></label><input type="date" id="${p}date" min="1900-01-01" max="2100-12-31"></div>
      <div class="field"><label for="${p}time" data-i="time"></label><input type="time" id="${p}time" value="12:00"></div></div>
      <label class="switch"><input type="checkbox" id="${p}notime"><span class="track" aria-hidden="true"></span><span data-i="notime"></span></label>
      <div class="field"><span class="lbl" data-i="gender"></span><div class="seg" role="radiogroup">
        <input type="radio" name="${p}g" id="${p}gm" value="M" ${p === 'A' ? 'checked' : ''}><label for="${p}gm"><b class="zh">乾</b><span data-i="male"></span></label>
        <input type="radio" name="${p}g" id="${p}gf" value="F" ${p === 'B' ? 'checked' : ''}><label for="${p}gf"><b class="zh">坤</b><span data-i="female"></span></label></div></div>
      <div class="place" id="${p}place">
        <div class="field"><label for="${p}pc" data-i="country"></label><select id="${p}pc" class="pc"></select></div>
        <div class="row2 grid2"><div class="field"><label for="${p}ps" data-i="state"></label><select id="${p}ps" class="ps"></select></div>
        <div class="field"><label for="${p}pt" data-i="city"></label><select id="${p}pt" class="pt"></select></div></div>
      </div>
      <div class="field"><label for="${p}tz" data-i="tz"></label><select id="${p}tz"></select></div></fieldset>`;
  }
  $('#cForm').innerHTML = `<div class="cgrid">${personForm('A')}${personForm('B')}</div>
    <p class="err" id="cErr" role="alert" hidden></p>
    <button class="primary" type="submit"><span data-i="cCalc"></span><span class="zh">合婚</span></button>`;
  const places = {}, lonOf = {};
  const setTzSel = (sel, off) => {
    if (off == null || isNaN(off)) return; const v = String(off);
    if (![...sel.options].some(o => o.value === v)) { const after = [...sel.options].find(o => parseFloat(o.value) > off); sel.add(new Option(A.fmtTz(off), v), after || null); }
    sel.value = v;
  };
  ['A', 'B'].forEach(p => {
    $(`#${p}tz`).innerHTML = [...$('#tz').options].filter(o => !o.dataset.extra).map(o => `<option value="${o.value}">${o.textContent}</option>`).join('');
    places[p] = Place.mount({
      root: $(`#${p}place`), lang: A.lang, t: A.t, date: () => $(`#${p}date`).value, time: () => $(`#${p}notime`).checked ? '12:00' : $(`#${p}time`).value,
      onPick: i => { lonOf[p] = i ? i.lon : null; if (i) setTzSel($(`#${p}tz`), i.off); }
    });
    const re = () => { const i = places[p].info(); if (i) setTzSel($(`#${p}tz`), i.off); };
    $(`#${p}date`).addEventListener('change', re); $(`#${p}time`).addEventListener('change', re);
    $(`#${p}notime`).addEventListener('change', e => { $(`#${p}time`).disabled = e.target.checked; re(); });
  });
  $('#useMine').onclick = () => { const d = A.store.get('bz_last', null); if (d) { setPerson('A', d); M.haptic('success'); } };
  function setPerson(p, d) {
    $(`#${p}name`).value = d.name || ''; $(`#${p}date`).value = d.date || ''; $(`#${p}time`).value = d.time || '12:00';
    $(`#${p}notime`).checked = !!d.noTime; $(`#${p}time`).disabled = !!d.noTime; setTzSel($(`#${p}tz`), d.tz ?? 7);
    $(`#${p}${d.gender === 'F' ? 'gf' : 'gm'}`).checked = true;
    lonOf[p] = d.lon ?? null;
    places[p].set(d.place || null);
  }
  function fillCoupleDefaults() {
    const c = A.store.get('bz_couple', null);
    if (c) { setPerson('A', c.a); setPerson('B', c.b); return; }
    const me = A.store.get('bz_last', null);
    ['A', 'B'].forEach(p => { $(`#${p}tz`).value = $('#tz').value; places[p].set(me && me.place ? { cc: me.place.cc } : { cc: A.lang() === 'id' ? 'ID' : '' }); });
    if (me) setPerson('A', me);
  }
  function readPerson(p) {
    const L = A.t(), date = $(`#${p}date`).value, noTime = $(`#${p}notime`).checked, time = $(`#${p}time`).value;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m || +m[1] < 1900 || +m[1] > 2100) return { err: L.errDate, el: `#${p}date` };
    if (!noTime && !/^\d{2}:\d{2}/.test(time)) return { err: L.errTime, el: `#${p}time` };
    const pl = places[p].get();
    return { name: $(`#${p}name`).value.trim(), date, time: noTime ? '' : time.slice(0, 5), noTime, tz: parseFloat($(`#${p}tz`).value), gender: document.querySelector(`input[name=${p}g]:checked`).value,
      place: pl, lon: pl && pl.lon != null ? pl.lon : (lonOf[p] ?? null) };
  }
  const calcP = d => { const [y, mo, da] = d.date.split('-').map(Number), [hh, mm] = (d.time || '12:00').split(':').map(Number); return Bazi.calc({ year: y, month: mo, day: da, hour: hh, minute: mm, tz: d.tz, lon: d.lon ?? null, gender: d.gender, noTime: d.noTime, lateZi: true }); };
  let lastMatch = null, cBusy = false;
  $('#cForm').addEventListener('submit', ev => {
    ev.preventDefault();
    const a = readPerson('A'), b = readPerson('B'), err = $('#cErr'), bad = a.err ? a : b.err ? b : null;
    if (bad) { err.textContent = bad.err; err.hidden = false; $(bad.el).focus(); M.shake($(bad.el)); return; }
    err.hidden = true; if (cBusy) return; cBusy = true;
    A.store.set('bz_couple', { a, b });
    lastMatch = { a, b, ra: calcP(a), rb: calcP(b) };
    M.stamp($('#cForm .primary'), '合婚').then(() => Nav.go('matchView', () => renderMatch(true))).finally(() => { cBusy = false; });
  });

  function miniChart(r, d) {
    const cols = r.pillars.slice().reverse();
    return `<div class="mini" style="--n:${cols.length}">${cols.map(p => `<span class="${p.key === 'day' ? 'me' : ''}">${ch(S[p.s], Bazi.elOf(p.s))}${ch(BR[p.b], Bazi.brEl(p.b))}</span>`).join('')}</div>`;
  }
  function renderMatch(animate) {
    if (!lastMatch) return;
    const { a, b, ra, rb } = lastMatch, x = X(), L = A.t();
    const nA = a.name || x.pA, nB = b.name || x.pB;
    const m = AN.match(ra, rb, { ...a, name: nA }, { ...b, name: nB }, A.lang());
    const C = 2 * Math.PI * 52, off = C * (1 - m.score / 100);
    const groups = ['dm', 'palace', 'zodiac', 'family', 'element'];
    $('#matchOut').innerHTML = `
      <div class="pair">
        <div class="who2 a"><span class="dmseal">${ch(S[ra.dm], Bazi.elOf(ra.dm))}</span><b>${esc(nA)}</b><small>${A.fmtDate(a.date)}</small></div>
        <div class="ring ${animate ? 'go' : 'done'}" style="--c:${C};--off:${off}"><svg viewBox="0 0 120 120"><circle class="rt" cx="60" cy="60" r="52"/><circle class="rv2 b${m.band}" cx="60" cy="60" r="52"/></svg>
          <div class="rnum"><b data-count="${m.score}">${m.score}</b><small>${x.mScore}</small></div></div>
        <div class="who2 b"><span class="dmseal">${ch(S[rb.dm], Bazi.elOf(rb.dm))}</span><b>${esc(nB)}</b><small>${A.fmtDate(b.date)}</small></div>
      </div>
      <p class="band b${m.band}">${m.bandLabel}</p>
      <section class="block"><h2>${x.mPillars}</h2><div class="minis"><div><small>${esc(nA)}</small>${miniChart(ra, a)}</div><div><small>${esc(nB)}</small>${miniChart(rb, b)}</div></div></section>
      <section class="block"><h2>${x.mBreak}</h2>${groups.map(g => {
        const it = m.items.filter(i => i.group === g);
        const sum = it.reduce((s, i) => s + i.pts, 0);
        return `<div class="mgroup"><div class="mgh"><span>${x.grp[g]}</span><b class="${sum > 0 ? 'p' : sum < 0 ? 'n' : ''}">${sum > 0 ? '+' : ''}${sum}</b></div>
          ${it.length ? it.map((i, j) => `<div class="mitem" style="--i:${j}"><span class="pts ${i.pts > 0 ? 'p' : i.pts < 0 ? 'n' : ''}">${i.pts > 0 ? '+' : ''}${i.pts}</span><div><b class="zh">${i.zh}</b><p>${i.text}</p></div></div>`).join('') : `<p class="muted">${x.noFactor}</p>`}</div>`;
      }).join('')}</section>
      <section class="block"><h2>${x.mNotes}</h2>${m.notes.map(n => `<p class="aline">${n}</p>`).join('')}</section>
      <p class="disc">${x.mDisc}</p>`;
    lastMatch.m = m;
    const ring = $('#matchOut .ring');
    if (animate && !M.reduced()) { requestAnimationFrame(() => requestAnimationFrame(() => ring.classList.add('done'))); M.countUp($('#matchOut .rnum')); M.reveal([...document.querySelectorAll('#matchOut .block')]); }
    else { ring.classList.add('done'); document.querySelectorAll('#matchOut .block').forEach(bk => bk.classList.add('seen')); }
    if (animate) M.haptic(m.band <= 1 ? 'success' : 'light');
  }
  $('#mEdit').onclick = () => Nav.go('coupleView');
  $('#mShare').onclick = () => {
    if (!lastMatch || !lastMatch.m) return;
    const { a, b, ra, rb, m } = lastMatch, x = X(), L = A.t();
    const gz = r => r.pillars.map(p => S[p.s] + BR[p.b]).join(' ');
    const nA = a.name || x.pA, nB = b.name || x.pB;
    const text = [`合婚 ${nA} + ${nB}`, `${x.mScore}: ${m.score}/100, ${m.bandLabel}`, `${nA}: ${gz(ra)}`, `${nB}: ${gz(rb)}`].join('\n');
    const person = (n, d, r) => ({ name: n, date: A.fmtDate(d.date), dm: S[r.dm], de: Bazi.elOf(r.dm),
      pillars: r.pillars.slice().reverse().map(p => ({ s: S[p.s], b: BR[p.b], se: Bazi.elOf(p.s), be: Bazi.brEl(p.b), me: p.key === 'day' })) });
    const items = m.items.slice().sort((p, q) => Math.abs(q.pts) - Math.abs(p.pts)).map(i => ({ pts: i.pts, zh: i.zh, name: x.grp[i.group] }));
    const card = () => ShareCard.matchCard({ a: person(nA, a, ra), b: person(nB, b, rb), score: m.score, band: m.band, bandLabel: m.bandLabel, scoreLbl: x.mScore, items, L, note: x.mDisc });
    const slug = s => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
    ShareCard.preview(card, `hehun-${slug(nA) || 'a'}-${slug(nB) || 'b'}.png`, text, L);
  };

  /* ================= language + boot ================= */
  window.onLangChange = () => {
    Tour.refresh();
    if (!$('#homeView').hidden) renderToday();
    places.A.refreshLang(); places.B.refreshLang();
    if (!$('#matchView').hidden) renderMatch(false);
  };
  A.applyLang();
  if (A.store.get('bz_onboarded', 0)) Nav.go('homeView', null, true);
  else Nav.go('welcomeView', null, true);
})();
