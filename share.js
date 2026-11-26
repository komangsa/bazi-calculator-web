/* 9:16 share card (1080 x 1920 PNG) drawn on canvas, so nothing is cropped and
   the layout does not depend on the current scroll position or screen size. */
(function () {
  const W = 1080, H = 1920, PAD = 88;
  const SANS = 'Roboto,"Noto Sans","Segoe UI",system-ui,"WenKai",sans-serif', ZH = '"WenKai","Noto Serif CJK SC",serif';
  const EV = ['--wood', '--fire', '--earth', '--metal', '--water'];

  function theme() {
    const cs = getComputedStyle(document.documentElement), v = k => cs.getPropertyValue(k).trim();
    return { bg: v('--bg'), surface: v('--surface'), raised: v('--raised'), text: v('--text'), muted: v('--muted'), faint: v('--faint'),
      accent: v('--accent'), ink: v('--accent-ink'), line: v('--line2'), pos: v('--pos'), neg: v('--neg'), warn: v('--warn'), el: EV.map(v) };
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function font(c, size, weight = 400, fam = SANS) { c.font = `${weight} ${size}px ${fam}`; }
  /* draw text that never exceeds maxW: shrink to minSize, then ellipsis */
  function fit(c, text, x, y, maxW, size, weight = 400, fam = SANS, minSize) {
    let s = size; minSize = minSize || Math.round(size * .7);
    font(c, s, weight, fam);
    while (c.measureText(text).width > maxW && s > minSize) { s -= 2; font(c, s, weight, fam); }
    let t = text;
    if (c.measureText(t).width > maxW) { while (t.length && c.measureText(t + '…').width > maxW) t = t.slice(0, -1); t += '…'; }
    c.fillText(t, x, y); return s;
  }
  function wrap(c, text, x, y, maxW, lh, maxLines) {
    const words = text.split(/\s+/); let line = '', n = 0;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (c.measureText(test).width > maxW && line) {
        if (n === maxLines - 1) { let t = line; while (c.measureText(t + '…').width > maxW) t = t.slice(0, -1); c.fillText(t + '…', x, y + n * lh); return n + 1; }
        c.fillText(line, x, y + n * lh); n++; line = words[i];
      } else line = test;
    }
    if (line) { c.fillText(line, x, y + n * lh); n++; }
    return n;
  }
  function seal(c, x, y, k, T) {
    c.save(); rr(c, x, y, 56 * k, 68 * k, 8 * k); c.fillStyle = T.accent; c.fill();
    c.fillStyle = T.ink; c.textAlign = 'center'; c.textBaseline = 'middle'; font(c, 25 * k, 500, ZH);
    c.fillText('八', x + 28 * k, y + 19 * k); c.fillText('字', x + 28 * k, y + 49 * k); c.restore();
  }
  function frame(T) {
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    c.fillStyle = T.bg; c.fillRect(0, 0, W, H);
    // faint accent wash at the top so the card reads as one object
    const g = c.createRadialGradient(W * .85, -80, 0, W * .85, -80, 900);
    g.addColorStop(0, T.accent + '2e'); g.addColorStop(1, T.accent + '00'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.textBaseline = 'alphabetic';
    seal(c, PAD, PAD, 1, T);
    c.fillStyle = T.text; font(c, 36, 700); c.fillText('Bazi Calculator', PAD + 80, PAD + 46);
    return { cv, c };
  }
  function footer(c, T, note) {
    c.strokeStyle = T.line; c.lineWidth = 2; c.beginPath(); c.moveTo(PAD, H - 220); c.lineTo(W - PAD, H - 220); c.stroke();
    c.fillStyle = T.faint; font(c, 26); c.textAlign = 'left';
    wrap(c, note, PAD, H - 166, W - PAD * 2, 36, 2);
    c.fillStyle = T.muted; font(c, 26, 600); c.fillText('komangsa.github.io/bazi-calculator-web', PAD, H - 72);
  }
  function pillarCol(c, T, x, y, w, h, p, o) {
    if (o.me) { rr(c, x, y, w, h, 0); c.fillStyle = T.accent + '24'; c.fill(); }
    const cx = x + w / 2; c.textAlign = 'center';
    c.fillStyle = T.text; font(c, 40, 500, ZH); c.fillText(o.k, cx, y + 64);
    c.fillStyle = T.muted; fit(c, o.kl, cx, y + 104, w - 20, 26, 600);
    c.fillStyle = o.me ? T.accent : T.text; font(c, 34, 500, ZH); c.fillText(o.god, cx, y + 168);
    c.fillStyle = T.el[o.se]; font(c, 150, 500, ZH); c.fillText(o.stem, cx, y + 340);
    c.fillStyle = T.el[o.be]; c.fillText(o.branch, cx, y + 500);
    c.fillStyle = T.muted; fit(c, o.animal, cx, y + 556, w - 20, 26, 400);
  }
  function elementsBar(c, T, y, pct, L) {
    const x0 = PAD, w = W - PAD * 2; let x = x0;
    const tot = pct.reduce((a, b) => a + b, 0) || 1;
    c.save(); rr(c, x0, y, w, 20, 10); c.clip();
    pct.forEach((p, i) => { const ww = w * p / tot; c.fillStyle = T.el[i]; c.fillRect(x, y, ww - (ww > 4 ? 3 : 0), 20); x += ww; });
    c.restore();
    const cw = w / 5; c.textAlign = 'center';
    pct.forEach((p, i) => {
      const cx = x0 + cw * i + cw / 2;
      c.fillStyle = T.el[i]; font(c, 56, 500, ZH); c.fillText('木火土金水'[i], cx, y + 104);
      c.fillStyle = T.text; font(c, 34, 700); c.fillText(p + '%', cx, y + 150);
      c.fillStyle = T.muted; font(c, 24); c.fillText(L.el[i], cx, y + 184);
    });
  }

  /* d: {name, sub, pillars:[{k,kl,god,stem,branch,se,be,animal,me}], dmLine, strength, fav:[{zh,name,e}], pct, luck, year, L, note} */
  function chartCard(d) {
    const T = theme(), { cv, c } = frame(T), L = d.L;
    c.textAlign = 'left'; c.fillStyle = T.text; fit(c, d.name, PAD, 300, W - PAD * 2, 76, 800);
    c.fillStyle = T.muted; fit(c, d.sub, PAD, 356, W - PAD * 2, 32, 400);
    // pillars panel
    const py = 412, ph = 600, n = d.pillars.length, cw = (W - PAD * 2) / n;
    c.save(); rr(c, PAD, py, W - PAD * 2, ph, 36); c.fillStyle = T.surface; c.fill(); c.clip();
    d.pillars.forEach((p, i) => pillarCol(c, T, PAD + cw * i, py, cw, ph, p, p));
    c.restore();
    c.strokeStyle = T.line; c.lineWidth = 2; rr(c, PAD, py, W - PAD * 2, ph, 36); c.stroke();
    for (let i = 1; i < n; i++) { c.beginPath(); c.moveTo(PAD + cw * i, py + 28); c.lineTo(PAD + cw * i, py + ph - 28); c.stroke(); }
    // day master
    let y = py + ph + 92; c.textAlign = 'left';
    c.fillStyle = T.muted; font(c, 26, 700); c.fillText(L.dm.toUpperCase(), PAD, y);
    c.fillStyle = T.text; fit(c, d.dmLine, PAD, y + 54, W - PAD * 2, 40, 700);
    c.fillStyle = T.muted; fit(c, d.strength, PAD, y + 100, W - PAD * 2, 30, 400);
    // elements
    y += 152; elementsBar(c, T, y, d.pct, L);
    // favourable + periods
    y += 260; c.textAlign = 'left';
    const rows = [[L.fav, d.fav], [d.luck[0], d.luck[1]], [d.year[0], d.year[1]]];
    rows.forEach(([k, v], i) => {
      const yy = y + i * 72;
      c.fillStyle = T.muted; fit(c, k, PAD, yy, 330, 28, 600);
      c.fillStyle = T.text; fit(c, v, PAD + 350, yy, W - PAD * 2 - 350, 30, 600);
    });
    footer(c, T, d.note);
    return cv;
  }

  /* m: {a:{name,date,dm,de,pillars:[{s,b,se,be,me}]}, b:{...}, score, band, bandLabel, items:[{pts,zh,text}], L, note, scoreLbl} */
  function matchCard(m) {
    const T = theme(), { cv, c } = frame(T);
    c.textAlign = 'center';
    c.fillStyle = T.muted; font(c, 30, 700); c.fillText('合婚', W / 2, 270);
    // ring
    const cx = W / 2, cy = 520, R = 170;
    c.lineWidth = 26; c.lineCap = 'round';
    c.strokeStyle = T.raised; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.stroke();
    const col = m.band <= 1 ? T.pos : m.band === 2 ? T.warn : T.neg;
    c.strokeStyle = col; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * m.score / 100); c.stroke();
    c.fillStyle = T.text; font(c, 140, 800); c.fillText(String(m.score), cx, cy + 40);
    c.fillStyle = T.muted; font(c, 28, 600); c.fillText(m.scoreLbl, cx, cy + 92);
    c.fillStyle = col; fit(c, m.bandLabel, cx, cy + R + 100, W - PAD * 2, 48, 800);
    // two people
    const colW = (W - PAD * 2 - 40) / 2;
    [m.a, m.b].forEach((p, k) => {
      const x = PAD + k * (colW + 40), y = 900;
      c.textAlign = 'left';
      c.fillStyle = T.el[p.de]; font(c, 96, 500, ZH); c.fillText(p.dm, x, y + 80);
      c.fillStyle = T.text; fit(c, p.name, x + 120, y + 40, colW - 120, 40, 800);
      c.fillStyle = T.muted; fit(c, p.date, x + 120, y + 86, colW - 120, 28, 400);
      // mini chart
      const my = y + 130, n = p.pillars.length, w = colW / n;
      c.save(); rr(c, x, my, colW, 210, 24); c.fillStyle = T.surface; c.fill(); c.clip();
      p.pillars.forEach((q, i) => {
        if (q.me) { c.fillStyle = T.accent + '24'; c.fillRect(x + w * i, my, w, 210); }
        c.textAlign = 'center'; font(c, 64, 500, ZH);
        c.fillStyle = T.el[q.se]; c.fillText(q.s, x + w * i + w / 2, my + 90);
        c.fillStyle = T.el[q.be]; c.fillText(q.b, x + w * i + w / 2, my + 172);
      });
      c.restore(); c.strokeStyle = T.line; c.lineWidth = 2; rr(c, x, my, colW, 210, 24); c.stroke();
    });
    // top factors
    let y = 1330; c.textAlign = 'left';
    m.items.slice(0, 5).forEach((it, i) => {
      const yy = y + i * 64, t = it.pts > 0 ? '+' + it.pts : String(it.pts);
      c.fillStyle = it.pts > 0 ? T.pos : it.pts < 0 ? T.neg : T.muted; font(c, 32, 800); c.fillText(t, PAD, yy);
      c.fillStyle = T.text; font(c, 34, 500, ZH); c.fillText(it.zh, PAD + 110, yy);
      const zw = c.measureText(it.zh).width + 20;
      c.fillStyle = T.muted; fit(c, it.name || '', PAD + 110 + zw, yy, W - PAD * 2 - 110 - zw, 30, 500, SANS);
    });
    footer(c, T, m.note);
    return cv;
  }

  async function ready() {
    try { await Promise.all([document.fonts.load('150px WenKai', '甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥木火土金水八字合婚'), document.fonts.load('700 40px Roboto'), document.fonts.ready]); } catch (e) {}
  }

  async function shareNative(url, fileName, text, dialogTitle) {
    const { Filesystem, Share } = window.Capacitor.Plugins;
    const data = url.split(',')[1];
    const r = await Filesystem.writeFile({ path: fileName, data, directory: 'CACHE' });
    await Share.share({ title: 'Bazi', text, files: [r.uri], dialogTitle });
  }

  /* preview sheet: image + share button */
  async function preview(build, fileName, text, L) {
    await ready();
    let cv;
    try { cv = build(); } catch (_) { window.BaziApp.toast(L.shareFail); return; }
    const url = cv.toDataURL('image/png');
    const native = window.Capacitor?.isNativePlatform?.();
    const action = native ? L.shareImg : (L.shareImg === 'Bagikan gambar' ? 'Unduh PNG' : 'Download PNG');
    Motion.sheet.open(`<div class="sc-prev"><img src="${url}" alt="${L.shareImg}, 9:16" width="1080" height="1920"></div>
      <div class="sc-act grid2"><button type="button" class="ghost sh-close">${L.close}</button><button type="button" class="primary sc-go">${action}</button></div>`);
    const btn = document.querySelector('.sc-go');
    btn.onclick = async () => {
      if (!native) {
        const a = document.createElement('a'); a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); a.remove(); Motion.sheet.close(); return;
      }
      btn.disabled = true;
      try { await shareNative(url, fileName, text, L.share); Motion.sheet.close(); }
      catch (e) { if (!(e && (e.name === 'AbortError' || /cancel/i.test(e.message || '')))) window.BaziApp.toast(L.shareFail); }
      finally { btn.disabled = false; }
    };
  }

  window.ShareCard = { chartCard, matchCard, preview };
})();
