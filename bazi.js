/* Bazi (Four Pillars) engine. Solar terms from astronomy-engine (VSOP87, seconds-level accuracy). */
(function (root) {
  const A = (typeof Astronomy !== 'undefined') ? Astronomy : (typeof require !== 'undefined' ? require('./astronomy.browser.min.js') : null);
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const HIDDEN = [[9],[5,9,7],[0,2,4],[1],[4,1,9],[2,6,4],[3,5],[5,3,1],[6,8,4],[7],[4,7,3],[8,0]];
  const HW = [1, 0.5, 0.3];
  const GODS_ZH = ['比肩','劫财','食神','伤官','偏财','正财','七杀','正官','偏印','正印'];
  const rad = Math.PI / 180;
  const mod = (a, n) => ((a % n) + n) % n;

  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  const sunLon = ms => A.SunPosition(new Date(ms)).elon; // apparent ecliptic longitude of date
  const findLon = (target, startMs, days) => A.SearchSunLongitude(target, new Date(startMs), days).date.getTime();

  function eqTimeMin(ms) { // equation of time (minutes), Meeus approximation
    const T = (ms / 86400000 + 2440587.5 - 2451545) / 36525;
    const L0 = mod(280.46646 + 36000.76983 * T, 360), M = 357.52911 + 35999.05029 * T, e = 0.016708634 - 0.000042037 * T;
    const y = Math.tan(23.4393 * rad / 2) ** 2;
    const E = y * Math.sin(2 * L0 * rad) - 2 * e * Math.sin(M * rad) + 4 * e * y * Math.sin(M * rad) * Math.cos(2 * L0 * rad)
      - 0.5 * y * y * Math.sin(4 * L0 * rad) - 1.25 * e * e * Math.sin(2 * M * rad);
    return 4 * E / rad;
  }
  const sexIdx = (s, b) => { for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i; return 0; };
  const elOf = s => Math.floor(s / 2);
  const brEl = b => elOf(HIDDEN[b][0]);
  // 0 比肩 1 劫财 2 食神 3 伤官 4 偏财 5 正财 6 七杀 7 正官 8 偏印 9 正印
  const tenGod = (dm, s) => mod(elOf(s) - elOf(dm), 5) * 2 + ((s % 2) === (dm % 2) ? 0 : 1);
  const yearPillar = y => ({ s: mod(y - 4, 10), b: mod(y - 4, 12) });

  function calc(o) {
    // o: {year,month,day,hour,minute,tz(hours),lon(deg E|null),gender 'M'|'F',lateZi(default true),useEot,noTime}
    const tz = o.tz == null ? 7 : o.tz;
    const hour = o.noTime ? 12 : o.hour, minute = o.noTime ? 0 : o.minute;
    const localMs = Date.UTC(o.year, o.month - 1, o.day, hour, minute);
    const utcMs = localMs - tz * 3600000;
    const lon = sunLon(utcMs);

    let adjMin = 0;
    const hasLon = o.lon != null && !isNaN(o.lon);
    if (hasLon && !o.noTime) {
      adjMin += (o.lon - tz * 15) * 4;
      if (o.useEot) adjMin += eqTimeMin(utcMs);
    }
    const adj = new Date(localMs + Math.round(adjMin) * 60000);
    const ay = adj.getUTCFullYear(), am = adj.getUTCMonth() + 1, ad = adj.getUTCDate(), ah = adj.getUTCHours(), amin = adj.getUTCMinutes();

    // year changes at Lichun (sun lon 315°)
    let by = o.year;
    if (o.month <= 2 && lon < 315 && lon > 180) by -= 1;
    const { s: yS, b: yB } = yearPillar(by);
    // month: Jie every 30° from 315°
    const m = Math.floor(mod(lon - 315, 360) / 30);
    const mB = (2 + m) % 12, mS = (mod(yS, 5) * 2 + 2 + m) % 10;
    // day
    let dayN = jdn(ay, am, ad);
    const lateZi = o.lateZi !== false, isZiNight = ah >= 23;
    if (lateZi && isZiNight) dayN += 1;
    const dIdx = mod(dayN + 49, 60), dS = dIdx % 10, dB = dIdx % 12;
    // hour: from 23:00 the hour stem follows the NEXT day's stem in both schools
    const hB = Math.floor(((ah + 1) % 24) / 2);
    const hBaseStem = (!lateZi && isZiNight) ? (dS + 1) % 10 : dS;
    const hS = (mod(hBaseStem, 5) * 2 + hB) % 10;

    const pillars = [{ key: 'year', s: yS, b: yB }, { key: 'month', s: mS, b: mB }, { key: 'day', s: dS, b: dB }];
    if (!o.noTime) pillars.push({ key: 'hour', s: hS, b: hB });
    const dm = dS;
    pillars.forEach(p => {
      p.hidden = HIDDEN[p.b].map(h => ({ s: h, god: tenGod(dm, h) }));
      p.god = p.key === 'day' ? null : tenGod(dm, p.s);
    });

    // element tally (stem 1, hidden main/mid/residual 1/.5/.3); strength weights month branch ×2 (月令)
    const el = [0, 0, 0, 0, 0], sw = [0, 0, 0, 0, 0];
    pillars.forEach(p => {
      el[elOf(p.s)] += 1; sw[elOf(p.s)] += 1;
      HIDDEN[p.b].forEach((h, i) => {
        const w = HIDDEN[p.b].length === 1 ? 1 : HW[i];
        el[elOf(h)] += w; sw[elOf(h)] += w * (p.key === 'month' ? 2 : 1);
      });
    });
    const dmE = elOf(dm), resE = mod(dmE - 1, 5);
    const tot = sw.reduce((a, b) => a + b, 0);
    const support = (sw[dmE] + sw[resE] - 1) / (tot - 1); // excludes the day master itself
    const strength = support >= 0.5 ? 'strong' : support >= 0.4 ? 'balanced' : 'weak';
    const outE = (dmE + 1) % 5, wealthE = (dmE + 2) % 5, offE = (dmE + 3) % 5;
    const favorable = strength === 'strong' ? [outE, wealthE, offE] : strength === 'weak' ? [resE, dmE] : [outE, resE];
    const unfavorable = strength === 'strong' ? [resE, dmE] : strength === 'weak' ? [offE, wealthE] : [];

    // luck pillars: days to next/prev Jie, 3 days = 1 year
    const male = o.gender !== 'F', yang = yS % 2 === 0, forward = (male && yang) || (!male && !yang);
    const curJieLon = mod(315 + 30 * m, 360), nextJieLon = mod(curJieLon + 30, 360);
    const nextJie = findLon(nextJieLon, utcMs, 40);
    const prevJie = findLon(curJieLon, utcMs - 40 * 86400000, 40);
    const days = (forward ? nextJie - utcMs : utcMs - prevJie) / 86400000;
    const totalMonths = Math.round(days * 4);
    const startYears = Math.floor(totalMonths / 12), startMonths = totalMonths % 12;
    const startDate = new Date(Date.UTC(o.year, o.month - 1 + totalMonths, Math.min(o.day, 28)));
    const mIdx = sexIdx(mS, mB), luck = [];
    for (let k = 1; k <= 8; k++) {
      const idx = mod(mIdx + (forward ? k : -k), 60), from = new Date(startDate);
      from.setUTCFullYear(startDate.getUTCFullYear() + (k - 1) * 10);
      luck.push({ s: idx % 10, b: idx % 12, age: startYears + (k - 1) * 10, year: from.getUTCFullYear(), fromMs: from.getTime(), god: tenGod(dm, idx % 10) });
    }

    return { pillars, dm, el, strength, support, favorable, unfavorable, forward, start: { years: startYears, months: startMonths }, luck,
      sunLon: lon, animal: yB, baziYear: by, solarAdjMin: Math.round(adjMin),
      solarTime: `${String(ah).padStart(2, '0')}:${String(amin).padStart(2, '0')}`, noTime: !!o.noTime };
  }

  const api = { STEMS, BRANCHES, HIDDEN, GODS_ZH, calc, elOf, brEl, tenGod, yearPillar, sunLon, findLon, jdn };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Bazi = api;
})(typeof window !== 'undefined' ? window : globalThis);
