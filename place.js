/* Birth place picker: country > state/province > city (GeoNames cities1000, CC BY 4.0).
   Picking a city fills longitude and the historical UTC offset for the birth date
   (IANA zone via Intl, so Indonesia 1950-1963 resolves to UTC+7:30 by itself). */
(function () {
  const cache = {};
  let countries = [];
  const getJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });
  let indexRequest;
  const loadCountries = () => indexRequest ||= getJSON('geo/countries.json').then(c => (countries = c)).catch(() => countries);
  const loadCountry = cc => cache[cc] ? Promise.resolve(cache[cc]) : getJSON(`geo/${cc}.json`).then(d => (cache[cc] = d));

  function partsOffset(tz, ms) {
    try {
      const v = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' }).formatToParts(new Date(ms)).find(p => p.type === 'timeZoneName').value;
      const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?(?::(\d{2}))?/.exec(v);
      if (!m) return 0;
      return (m[1] === '-' ? -1 : 1) * (+m[2] + (+(m[3] || 0)) / 60 + (+(m[4] || 0)) / 3600);
    } catch (e) { return null; }
  }
  /* offset (hours) in force at a local wall-clock time in zone tz */
  function offsetAt(tz, date, time) {
    const [y, mo, d] = (date || '2000-01-01').split('-').map(Number), [h, mi] = (time || '12:00').split(':').map(Number);
    const local = Date.UTC(y, mo - 1, d, h || 0, mi || 0);
    let off = partsOffset(tz, local); if (off == null) return null;
    off = partsOffset(tz, local - off * 3600e3) ?? off;
    return Math.round(off * 60) / 60;
  }

  const opt = (sel, label, value) => { const o = new Option(label, value); sel.add(o); return o; };

  /* p: { root, lang(), t(), date(), time(), onPick(info|null) } */
  function mount(p) {
    const cSel = p.root.querySelector('.pc'), sSel = p.root.querySelector('.ps'), tSel = p.root.querySelector('.pt');
    let cur = null, pending = null; // active country and request
    const names = () => {
      let dn = null; try { dn = new Intl.DisplayNames([p.lang()], { type: 'region' }); } catch (e) {}
      return countries.map(([cc, en]) => [cc, (dn && dn.of(cc)) || en]).sort((a, b) => a[1].localeCompare(b[1], p.lang()));
    };
    function fillCountries() {
      const v = cSel.value; cSel.innerHTML = ''; opt(cSel, p.t().pickCountry, '');
      names().forEach(([cc, n]) => opt(cSel, n, cc)); cSel.value = v;
    }
    function fillStates() {
      sSel.innerHTML = ''; tSel.innerHTML = '';
      opt(sSel, p.t().pickState, ''); opt(tSel, p.t().pickCity, '');
      sSel.disabled = !cur; tSel.disabled = true;
      if (!cur) return;
      cur.data.s.forEach((s, i) => opt(sSel, s[0] || p.t().otherArea, i));
      if (cur.data.s.length === 1) { sSel.value = '0'; fillCities(); }
    }
    function fillCities() {
      tSel.innerHTML = ''; opt(tSel, p.t().pickCity, '');
      const st = cur && cur.data.s[sSel.value];
      tSel.disabled = !st; if (!st) return;
      st[1].forEach((c, i) => opt(tSel, c[0], i));
    }
    function info() {
      const st = cur && cur.data.s[sSel.value], c = st && st[1][tSel.value];
      if (!c) return null;
      const iana = cur.data.tz[c[2] || 0];
      return { cc: cur.cc, st: st[0], city: c[0], lon: c[1], iana, off: offsetAt(iana, p.date(), p.time()) };
    }
    const emit = () => p.onPick(info());
    async function setCountry(cc) {
      pending = null;
      p.root.classList.remove('loading');
      cSel.value = cc || '';
      cur = null; fillStates();
      if (!cc) return;
      p.root.classList.add('loading');
      const request = {};
      pending = request;
      const data = await loadCountry(cc).catch(() => null);
      if (pending !== request || cSel.value !== cc) return;
      p.root.classList.remove('loading');
      cur = data ? { cc, data } : null;
      fillStates();
    }
    cSel.addEventListener('change', () => { const next = setCountry(cSel.value); emit(); return next; });
    sSel.addEventListener('change', () => { fillCities(); emit(); });
    tSel.addEventListener('change', emit);

    const api = {
      ready: loadCountries().then(() => { fillCountries(); fillStates(); }),
      refreshLang() { if (!countries) return; fillCountries(); const s = sSel.value, c = tSel.value; fillStates(); sSel.value = s; fillCities(); tSel.value = c; },
      info, offsetNow: () => { const i = info(); return i && i.off; },
      get() { const i = info(); return i ? { cc: i.cc, st: i.st, city: i.city, iana: i.iana, lon: i.lon } : (cSel.value ? { cc: cSel.value } : null); },
      async set(pl) {
        await api.ready;
        if (!pl || !pl.cc) { await setCountry(''); return; }
        await setCountry(pl.cc);
        if (!cur || cur.cc !== pl.cc) return;
        const si = cur.data.s.findIndex(s => s[0] === pl.st);
        if (si >= 0) { sSel.value = String(si); fillCities(); const ci = cur.data.s[si][1].findIndex(c => c[0] === pl.city); if (ci >= 0) tSel.value = String(ci); }
      }
    };
    return api;
  }
  window.Place = { mount, offsetAt };
})();
