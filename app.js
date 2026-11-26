(function () {
  const $ = s => document.querySelector(s);
  const PY_S = ['Jiǎ','Yǐ','Bǐng','Dīng','Wù','Jǐ','Gēng','Xīn','Rén','Guǐ'];
  const PY_B = ['Zǐ','Chǒu','Yín','Mǎo','Chén','Sì','Wǔ','Wèi','Shēn','Yǒu','Xū','Hài'];
  const ECLS = ['w','f','e','m','s'], EVAR = ['wood','fire','earth','metal','water'], EL_CH = ['木','火','土','金','水'];
  const STR_ZH = { strong: '身强', balanced: '中和', weak: '身弱' };
  const COL_ZH = { year: '年', month: '月', day: '日', hour: '时' };
  const T = {
    id: {
      title:'Bazi', lead:'Baca empat pilar kelahiranmu', sub:'Masukkan tanggal dan jam lahir. Perhitungan memakai posisi matahari yang sebenarnya.',
      name:'Nama', namePh:'Opsional', date:'Tanggal lahir', time:'Jam lahir', gender:'Jenis kelamin', male:'Pria', female:'Wanita',
      tz:'Zona waktu saat lahir', notime:'Jam lahir tidak diketahui',
      tzHint:'Pilih zona yang berlaku saat itu. Jawa dan Sumatra memakai UTC+7:30 pada 1950 sampai 1963.',
      advanced:'Pengaturan lanjutan', lon:'Bujur', city:'Kota',
      place:'Tempat lahir', country:'Negara', state:'Provinsi', pickCountry:'Pilih negara', pickState:'Pilih provinsi', pickCity:'Pilih kota', otherArea:'Lainnya',
      lonHint:'Terisi otomatis dari kota. Dipakai untuk koreksi waktu lokal.', tzAuto:z=>`Terisi otomatis dari kota (${z}), sesuai aturan yang berlaku pada tanggal lahir. Bisa diubah.`,
      shareImg:'Bagikan gambar', imgSaved:'Gambar disimpan', shareFail:'Gagal membagikan gambar', luckNow:'Pilar keberuntungan', yearNow:'Tahun ini',
      eot:'Pakai waktu surya sejati', late:'Jam 23.00 sampai 24.00 masuk hari berikutnya',
      calc:'Hitung', edit:'Ubah', back:'Kembali',
      dm:'Day Master', elements:'Lima elemen', luck:'Pilar keberuntungan', annual:'Pilar tahunan',
      history:'Tersimpan', share:'Bagikan', save:'Simpan', saved:'Bagan disimpan', copied:'Disalin ke clipboard',
      hour:'Jam', day:'Hari', month:'Bulan', year:'Tahun', self:'Diri',
      el:['Kayu','Api','Tanah','Logam','Air'], yin:'Yin', yang:'Yang',
      gods:['Sahabat','Perampas Harta','Dewa Makanan','Perusak Jabatan','Harta Tak Langsung','Harta Langsung','Tujuh Pembunuh','Pejabat Langsung','Sumber Tak Langsung','Sumber Langsung'],
      animals:['Tikus','Kerbau','Macan','Kelinci','Naga','Ular','Kuda','Kambing','Monyet','Ayam','Anjing','Babi'],
      dmDesc:['Pohon besar. Berprinsip, teguh, dan melindungi orang lain. Kadang keras kepala.','Bunga dan tanaman rambat. Luwes, diplomatis, artistik, dan pandai beradaptasi.','Matahari. Hangat, murah hati, ekspresif, dan optimis. Kadang impulsif.','Nyala lilin. Peka, perhatian, halus, dan menginspirasi. Cenderung sensitif.','Gunung. Stabil, dapat diandalkan, dan dipercaya. Kadang kaku.','Tanah ladang. Mengasuh, praktis, dan banyak akal.','Kapak dan pedang. Tegas, berani, adil, dan lugas.','Perhiasan. Elegan, teliti, dan perfeksionis.','Samudra. Cerdas, dinamis, dan mencintai kebebasan.','Hujan dan embun. Intuitif, lembut, imajinatif, dan bijak.'],
      dmHead:(p,yy,e)=>`${p}, ${e} ${yy}`, animal:a=>`Shio ${a}`,
      strength:{ strong:'Kuat', balanced:'Seimbang', weak:'Lemah' }, strLbl:'Kekuatan diri', weakL:'Lemah', strongL:'Kuat',
      fav:'Pendukung', unfav:'Dihindari', strNote:'Perkiraan sederhana metode 扶抑 dengan bobot bulan dua kali. Pola khusus tidak dihitung.',
      luckmeta:(f,y,m)=>`${f?'Maju':'Mundur'}, mulai usia ${y} th ${m} bln`, age:a=>`Usia ${a}`,
      solar:'Waktu surya', min:'mnt', noHour:'tanpa jam',
      errDate:'Isi tanggal lahir antara tahun 1900 dan 2100.', errTime:'Isi jam lahir, atau aktifkan "jam lahir tidak diketahui".', errLon:'Bujur harus angka antara -180 dan 180.',
      disc:'Batas istilah matahari dihitung secara astronomis. Hasil ini untuk refleksi pribadi, bukan nasihat profesional.',
      pick:'Pilih kota', del:'Hapus', unnamed:'Tanpa nama', close:'Tutup', luckOne:'Pilar keberuntungan', yearOne:'Tahun', tapHint:'Ketuk pilar atau elemen untuk detail',
      pillarOf:k=>({year:'Pilar Tahun',month:'Pilar Bulan',day:'Pilar Hari',hour:'Pilar Jam'})[k],
      palace:{year:'Leluhur, keluarga besar, dan masa kecil (usia 1 sampai 16).',month:'Orang tua, saudara, dan karier awal (usia 17 sampai 32).',day:'Diri sendiri dan pasangan (usia 33 sampai 48).',hour:'Anak, ambisi, dan masa tua (usia 49 ke atas).'},
      stemL:'Batang langit', branchL:'Cabang bumi', godL:'Bintang (十神)', hiddenL:'Batang tersembunyi', meaningL:'Makna posisi', periodL:'Periode', ageL:'Usia',
      godDesc:['Kemandirian, teman sebaya, rasa percaya diri.','Persaingan, keberanian ambil risiko, pengeluaran.','Kreativitas, kenikmatan, ekspresi yang tenang.','Bakat, pemberontakan, bicara blak-blakan.','Peluang, uang tak terduga, jiwa dagang.','Penghasilan tetap, hemat, tanggung jawab.','Tekanan, tantangan, keberanian dan disiplin keras.','Status, aturan, reputasi, dan karier.','Intuisi, ilmu tidak umum, penyendiri.','Dukungan, pendidikan, perlindungan ibu.'],
      elDesc:['Tumbuh, berkembang, kebaikan.','Semangat, ekspresi, kehangatan.','Stabil, menampung, dapat dipercaya.','Tegas, rapi, keadilan.','Mengalir, cerdas, adaptif.']
    },
    en: {
      title:'Bazi', lead:'Read your four pillars of birth', sub:'Enter your birth date and time. Calculated from the true position of the sun.',
      name:'Name', namePh:'Optional', date:'Birth date', time:'Birth time', gender:'Gender', male:'Male', female:'Female',
      tz:'Time zone at birth', notime:'Birth time unknown',
      tzHint:'Pick the zone in force at the time. Java and Sumatra used UTC+7:30 from 1950 to 1963.',
      advanced:'Advanced settings', lon:'Longitude', city:'City',
      place:'Place of birth', country:'Country', state:'State / province', pickCountry:'Choose a country', pickState:'Choose a state', pickCity:'Choose a city', otherArea:'Other',
      lonHint:'Filled in from the city. Used for the local time correction.', tzAuto:z=>`Filled in from the city (${z}), using the rules in force on the birth date. You can change it.`,
      shareImg:'Share image', imgSaved:'Image saved', shareFail:'Could not share the image', luckNow:'Luck pillar', yearNow:'This year',
      eot:'Use true solar time', late:'Count 23:00 to 24:00 as the next day',
      calc:'Calculate', edit:'Edit', back:'Back',
      dm:'Day Master', elements:'Five elements', luck:'Luck pillars', annual:'Annual pillars',
      history:'Saved', share:'Share', save:'Save', saved:'Chart saved', copied:'Copied to clipboard',
      hour:'Hour', day:'Day', month:'Month', year:'Year', self:'Self',
      el:['Wood','Fire','Earth','Metal','Water'], yin:'Yin', yang:'Yang',
      gods:['Friend','Rob Wealth','Eating God','Hurting Officer','Indirect Wealth','Direct Wealth','Seven Killings','Direct Officer','Indirect Resource','Direct Resource'],
      animals:['Rat','Ox','Tiger','Rabbit','Dragon','Snake','Horse','Goat','Monkey','Rooster','Dog','Pig'],
      dmDesc:['A great tree. Principled, steady, and protective of others. Can be stubborn.','Flowers and vines. Flexible, diplomatic, artistic, and adaptable.','The sun. Warm, generous, expressive, and optimistic. Can be impulsive.','A candle flame. Perceptive, caring, refined, and inspiring. Often sensitive.','A mountain. Stable, dependable, and trusted. Can be rigid.','Field soil. Nurturing, practical, and resourceful.','An axe or sword. Decisive, brave, fair, and direct.','Fine jewellery. Elegant, precise, and a perfectionist.','The ocean. Clever, dynamic, and freedom-loving.','Rain and dew. Intuitive, gentle, imaginative, and wise.'],
      dmHead:(p,yy,e)=>`${p}, ${yy} ${e}`, animal:a=>`${a} year`,
      strength:{ strong:'Strong', balanced:'Balanced', weak:'Weak' }, strLbl:'Self strength', weakL:'Weak', strongL:'Strong',
      fav:'Favourable', unfav:'Avoid', strNote:'A simple 扶抑 estimate with the month branch counted twice. Special structures are not covered.',
      luckmeta:(f,y,m)=>`${f?'Forward':'Backward'}, starts at ${y}y ${m}m`, age:a=>`Age ${a}`,
      solar:'Solar time', min:'min', noHour:'no hour',
      errDate:'Enter a birth date between 1900 and 2100.', errTime:'Enter a birth time, or turn on "birth time unknown".', errLon:'Longitude must be a number from -180 to 180.',
      disc:'Solar-term boundaries are computed astronomically. Results are for personal reflection, not professional advice.',
      pick:'Choose a city', del:'Delete', unnamed:'Unnamed', close:'Close', luckOne:'Luck pillar', yearOne:'Year', tapHint:'Tap a pillar or element for details',
      pillarOf:k=>({year:'Year pillar',month:'Month pillar',day:'Day pillar',hour:'Hour pillar'})[k],
      palace:{year:'Ancestry, extended family, and childhood (ages 1 to 16).',month:'Parents, siblings, and early career (ages 17 to 32).',day:'The self and the spouse (ages 33 to 48).',hour:'Children, ambitions, and later life (age 49 on).'},
      stemL:'Heavenly stem', branchL:'Earthly branch', godL:'Ten God (十神)', hiddenL:'Hidden stems', meaningL:'What this position covers', periodL:'Period', ageL:'Age',
      godDesc:['Independence, peers, self-confidence.','Competition, risk-taking, spending.','Creativity, enjoyment, easy self-expression.','Talent, rebellion, outspoken ideas.','Opportunity, windfalls, a trader\'s instinct.','Steady income, thrift, responsibility.','Pressure, challenges, courage and hard discipline.','Status, rules, reputation, and career.','Intuition, unusual knowledge, solitude.','Support, education, protection.'],
      elDesc:['Growth, expansion, kindness.','Drive, expression, warmth.','Stability, holding, trust.','Decisiveness, order, justice.','Flow, intelligence, adaptability.']
    }
  };
  const TZS = [-12,-11,-10,-9.5,-9,-8,-7,-6,-5,-4,-3.5,-3,-2,-1,0,1,2,3,3.5,4,4.5,5,5.5,5.75,6,6.5,7,7.5,8,8.5,8.75,9,9.5,10,10.5,11,12,12.75,13,14];
  const TZ_NAME = { 7:'  WIB', 8:'  WITA', 9:'  WIT' };
  const fmtTz = h => { const s = h < 0 ? '-' : '+', a = Math.abs(h), hh = Math.floor(a), mm = Math.round((a - hh) * 60); return `UTC${s}${hh}${mm ? ':' + String(mm).padStart(2, '0') : ''}${TZ_NAME[h] || ''}`; };
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nav = (navigator.language || '').toLowerCase();
  let lang = store.get('bz_lang', null) || (nav.startsWith('en') ? 'en' : 'id');
  let last = null, lastInput = null;
  const t = () => T[lang];

  const tzSel = $('#tz');
  TZS.forEach(h => tzSel.add(new Option(fmtTz(h), h)));
  const devTz = -new Date().getTimezoneOffset() / 60;
  tzSel.value = String(TZS.includes(devTz) ? devTz : 7);
  /* set a tz <select> to an offset, adding a one-off option for historical offsets (e.g. local mean time) */
  function setTz(sel, off) {
    if (off == null || isNaN(off)) return;
    const v = String(off);
    if (![...sel.options].some(o => o.value === v)) {
      const o = new Option(fmtTz(off), v); o.dataset.extra = '1';
      const after = [...sel.options].find(x => parseFloat(x.value) > off); sel.add(o, after || null);
    }
    sel.value = v;
  }
  const place = Place.mount({
    root: $('#placeSelf'), lang: () => lang, t: () => T[lang], date: () => $('#date').value, time: () => $('#notime').checked ? '12:00' : $('#time').value,
    onPick: i => { $('#lon').value = i ? i.lon : ''; if (i) setTz(tzSel, i.off); tzHelp(i); }
  });
  function tzHelp(i) { const h = $('#tzHelp'); h.textContent = i ? T[lang].tzAuto(i.iana) : T[lang].tzHint; }
  const reTz = () => { const i = place.info(); if (i) setTz(tzSel, i.off); };
  $('#date').addEventListener('change', reTz); $('#time').addEventListener('change', reTz);
  $('#notime').addEventListener('change', e => { $('#time').disabled = e.target.checked; reTz(); });

  function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 2000); }

  function applyLang() {
    document.documentElement.lang = lang;
    const xt = k => { const v = t()[k]; return v !== undefined ? v : (window.EXTRA_T && window.EXTRA_T[lang][k]); };
    document.querySelectorAll('[data-i]').forEach(n => { const v = xt(n.dataset.i); if (typeof v === 'string') n.textContent = v; });
    document.querySelectorAll('[data-ph]').forEach(n => n.placeholder = xt(n.dataset.ph) || '');
    $('#back').setAttribute('aria-label', t().back);
    document.querySelectorAll('.pg').forEach(b => b.setAttribute('aria-label', lang === 'id' ? (b.classList.contains('prev') ? 'Pilar sebelumnya' : 'Pilar berikutnya') : (b.classList.contains('prev') ? 'Previous pillars' : 'Next pillars')));
    document.querySelectorAll('.lang button').forEach(b => { b.classList.toggle('on', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang); });
    place.refreshLang(); tzHelp(place.info()); renderHistory();
    if (last) render(last, lastInput, false);
    if (window.onLangChange) window.onLangChange(lang);
  }
  document.querySelectorAll('.lang button').forEach(b => b.onclick = () => { if (b.dataset.lang === lang) return; lang = b.dataset.lang; store.set('bz_lang', lang); document.querySelectorAll('.lang button').forEach(x => x.classList.toggle('on', x === b)); Motion.swap(applyLang); });

  // views
  function show(view, after) {
    const res = view === 'res';
    return window.Nav.go(res ? 'resView' : 'formView', after);
  }
  $('#edit').onclick = () => show('form');

  const ch = (c, el) => `<span class="ch ${ECLS[el]}">${c}</span>`;
  const fmtDate = d => { const [y, m, dd] = d.split('-').map(Number); return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }); };

  function render(r, d, animate) {
    const L = t(), S = Bazi.STEMS, Br = Bazi.BRANCHES, now = Date.now(), cy = new Date().getFullYear();
    $('#whoName').textContent = d.name || fmtDate(d.date);
    $('#whoMeta').textContent = [d.name ? fmtDate(d.date) : null, d.noTime ? L.noHour : d.time, fmtTz(d.tz).replace(/\s+/g, ' '), d.gender === 'F' ? L.female : L.male].filter(Boolean).join(', ');

    // chart: traditional right-to-left order, hour first on the left
    const pils = r.pillars.slice().reverse(), chart = $('#chart');
    chart.style.setProperty('--n', pils.length);
    chart.innerHTML = pils.map((p, i) => `<div class="col ${p.key === 'day' ? 'me' : ''}" style="--i:${i}" role="button" tabindex="0" data-pk="${p.key}" aria-label="${L.pillarOf(p.key)} ${S[p.s]}${Br[p.b]}">
      <div class="k"><b class="zh">${COL_ZH[p.key]}</b>${L[p.key]}</div>
      <div class="gd">${p.god == null ? `<b class="zh">日主</b>${L.self}` : `<b class="zh">${Bazi.GODS_ZH[p.god]}</b>${L.gods[p.god]}`}</div>
      ${ch(S[p.s], Bazi.elOf(p.s))}<div class="py">${PY_S[p.s]}</div>
      ${ch(Br[p.b], Bazi.brEl(p.b))}<div class="py">${PY_B[p.b]}<br>${L.animals[p.b]}</div>
      <div class="hid">${p.hidden.map(h => `<span>${ch(S[h.s], Bazi.elOf(h.s))}<span class="zh">${Bazi.GODS_ZH[h.god]}</span></span>`).join('')}</div></div>`).join('');
    chart.classList.remove('in'); if (animate) { void chart.offsetWidth; chart.classList.add('in'); }
    $('#meta').textContent = `${lang === 'id' ? 'Bujur matahari' : 'Solar longitude'} ${r.sunLon.toFixed(2)}°` +
      (r.noTime ? '' : `. ${L.solar} ${r.solarTime}${r.solarAdjMin ? ` (${r.solarAdjMin > 0 ? '+' : ''}${r.solarAdjMin} ${L.min})` : ''}`);

    // day master
    const dm = r.dm, e = Bazi.elOf(dm);
    $('#dm').innerHTML = `<div class="stamp">${ch(S[dm], e)}</div><div class="t"><b>${L.dmHead(PY_S[dm], dm % 2 ? L.yin : L.yang, L.el[e])}</b><p>${L.dmDesc[dm]} ${L.animal(L.animals[r.animal])}.</p></div>`;
    const lvl = r.support < 0.3 ? 1 : r.support < 0.4 ? 2 : r.support < 0.5 ? 3 : r.support < 0.6 ? 4 : 5;
    const elList = a => `<div class="els">${a.map(i => `<em class="${ECLS[i]}">${ch(EL_CH[i], i)}${L.el[i]}</em>`).join('')}</div>`;
    $('#str').innerHTML = `<div class="top"><span>${L.strLbl}</span><b>${L.strength[r.strength]}<span class="zh">${STR_ZH[r.strength]}</span></b></div>
      <div class="steps ${animate ? 'in' : ''}" role="img" aria-label="${L.strLbl} ${lvl}/5">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= lvl ? 'on' : ''}" style="--i:${k}"></i>`).join('')}</div>
      <div class="scale"><span>${L.weakL}</span><span>${L.strongL}</span></div>
      <div class="fav"><span>${L.fav}</span>${elList(r.favorable)}${r.unfavorable.length ? `<span>${L.unfav}</span>${elList(r.unfavorable)}` : ''}</div>
      <p class="fine">${L.strNote}</p>`;

    // elements
    const tot = r.el.reduce((a, b) => a + b, 0), pct = r.el.map(v => Math.round(v / tot * 100));
    const rib = $('#ribbon');
    rib.innerHTML = r.el.map((v, i) => v > 0 ? `<i class="${ECLS[i]}" style="flex:${v};background:var(--${EVAR[i]});--i:${i}"></i>` : '').join('');
    rib.setAttribute('aria-label', r.el.map((v, i) => `${L.el[i]} ${pct[i]}%`).join(', '));
    rib.classList.remove('in'); if (animate) { void rib.offsetWidth; rib.classList.add('in'); }
    $('#legend').innerHTML = r.el.map((v, i) => `<button type="button" data-e="${ECLS[i]}" aria-pressed="false">${ch(EL_CH[i], i)}<b data-count="${pct[i]}" data-suffix="%" data-delay="${i * 60}">${pct[i]}%</b><small>${L.el[i]}</small></button>`).join('');
    $('#legend').closest('.block').dataset.onseen = '1';
    delete $('#resView').dataset.spot;

    // luck pillars
    $('#luckmeta').textContent = L.luckmeta(r.forward, r.start.years, r.start.months);
    const cur = r.luck.findIndex((l, i) => l.fromMs <= now && (i === r.luck.length - 1 || now < r.luck[i + 1].fromMs));
    $('#luck').innerHTML = r.luck.map((l, i) => `<div class="tab ${i === cur ? 'now' : ''}" role="button" tabindex="0" data-lk="${i}"><span class="a">${L.age(l.age)}</span>${ch(S[l.s], Bazi.elOf(l.s))}${ch(Br[l.b], Bazi.brEl(l.b))}<span class="g zh">${Bazi.GODS_ZH[l.god]}</span><span class="y">${l.year}</span></div>`).join('');

    // annual pillars
    const by = Number(d.date.slice(0, 4)), ann = [];
    for (let y = cy; y < cy + 10; y++) { const p = Bazi.yearPillar(y); ann.push(`<div class="tab ${y === cy ? 'now' : ''}" role="button" tabindex="0" data-yr="${y}"><span class="a">${y}</span>${ch(S[p.s], Bazi.elOf(p.s))}${ch(Br[p.b], Bazi.brEl(p.b))}<span class="g zh">${Bazi.GODS_ZH[Bazi.tenGod(dm, p.s)]}</span><span class="y">${L.age(y - by)}</span></div>`); }
    $('#annual').innerHTML = ann.join('');
    $('#hint').textContent = L.tapHint;
    if (animate) Motion.reveal([...document.querySelectorAll('#resView .block')]);
    else document.querySelectorAll('#resView .block').forEach(b => b.classList.add('seen'));
    if (window.renderAnalysis) window.renderAnalysis(r, d, animate);
    // keep the current period in view, aligned to the snap edge with one earlier item visible
    requestAnimationFrame(() => { Strips.focus($('#luck')); Strips.focus($('#annual')); });
  }

  /* horizontal strips: arrow pager, mouse drag, edge fades (touch uses native scroll) */
  const Strips = window.Strips = (() => {
    const pad = el => parseFloat(getComputedStyle(el).paddingLeft) || 0;
    function update(el) {
      const pg = document.querySelector(`.pager[data-for="${el.id}"]`), max = el.scrollWidth - el.clientWidth - 2;
      el.classList.toggle('at-start', el.scrollLeft <= 2); el.classList.toggle('at-end', el.scrollLeft >= max);
      if (pg) { pg.hidden = max <= 0; pg.querySelector('.prev').disabled = el.scrollLeft <= 2; pg.querySelector('.next').disabled = el.scrollLeft >= max; }
    }
    function step(el, dir) {
      const items = [...el.children], w = items[0] ? items[0].offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0) : 80;
      const n = Math.max(1, Math.floor((el.clientWidth - pad(el) * 2) / w) - 1);
      el.scrollBy({ left: dir * n * w, behavior: Motion.reduced() ? 'auto' : 'smooth' });
    }
    function bind(el) {
      el.addEventListener('scroll', () => update(el), { passive: true });
      const pg = document.querySelector(`.pager[data-for="${el.id}"]`);
      if (pg) { pg.querySelector('.prev').onclick = () => step(el, -1); pg.querySelector('.next').onclick = () => step(el, 1); }
      let x0 = 0, s0 = 0, drag = false, moved = false, pid = null;
      el.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; drag = true; moved = false; pid = e.pointerId; x0 = e.clientX; s0 = el.scrollLeft; });
      el.addEventListener('pointermove', e => {
        if (!drag || e.pointerId !== pid) return;
        const dx = e.clientX - x0;
        if (!moved && Math.abs(dx) > 5) { moved = true; el.setPointerCapture(pid); el.classList.add('dragging'); }
        if (moved) el.scrollLeft = s0 - dx;
      });
      const end = () => { if (!drag) return; drag = false; if (moved) { el.classList.remove('dragging'); setTimeout(() => { moved = false; }, 0); } };
      el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
      el.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); } }, true);
      addEventListener('resize', () => update(el));
    }
    function focus(el) {
      const n = el.querySelector('.now');
      if (n) { const prev = n.previousElementSibling || n; el.scrollLeft = Math.max(0, prev.offsetLeft - pad(el)); }
      update(el);
    }
    return { bind, focus, update };
  })();
  Strips.bind($('#luck')); Strips.bind($('#annual'));

  function readForm() {
    const L = t(), date = $('#date').value, time = $('#time').value, noTime = $('#notime').checked;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (!m || +m[1] < 1900 || +m[1] > 2100) return { err: L.errDate, el: '#date' };
    if (!noTime && !/^\d{2}:\d{2}/.test(time)) return { err: L.errTime, el: '#time' };
    const lonRaw = $('#lon').value.trim(), lon = lonRaw === '' ? null : Number(lonRaw.replace(',', '.'));
    if (lon != null && (isNaN(lon) || lon < -180 || lon > 180)) { $('.adv').open = true; return { err: L.errLon, el: '#lon' }; }
    return { name: $('#name').value.trim(), date, time: noTime ? '' : time.slice(0, 5), noTime, tz: parseFloat(tzSel.value), lon, place: place.get(),
      gender: document.querySelector('input[name=g]:checked').value, useEot: $('#eot').checked, lateZi: $('#late').checked };
  }
  function fillForm(d) {
    $('#name').value = d.name || ''; $('#date').value = d.date; $('#time').value = d.time || '12:00';
    $('#notime').checked = !!d.noTime; $('#time').disabled = !!d.noTime; setTz(tzSel, d.tz);
    $('#lon').value = d.lon == null ? '' : d.lon; $('#eot').checked = !!d.useEot; $('#late').checked = d.lateZi !== false;
    (d.gender === 'F' ? $('#gf') : $('#gm')).checked = true;
    place.set(d.place || null).then(() => tzHelp(place.info()));
  }
  function compute(d) {
    const [y, mo, da] = d.date.split('-').map(Number), [hh, mm] = (d.time || '12:00').split(':').map(Number);
    lastInput = d;
    last = Bazi.calc({ year: y, month: mo, day: da, hour: hh, minute: mm, tz: d.tz, lon: d.lon, gender: d.gender, useEot: d.useEot, lateZi: d.lateZi, noTime: d.noTime });
    store.set('bz_last', d);
  }

  let busy = false;
  $('#f').addEventListener('submit', ev => {
    ev.preventDefault();
    const d = readForm(), err = $('#err');
    if (d.err) { err.textContent = d.err; err.hidden = false; $(d.el).focus(); Motion.shake($(d.el)); return; }
    err.hidden = true;
    if (busy) return; busy = true;
    compute(d);
    Motion.stamp($('#f .primary')).then(() => show('res', () => render(last, d, true))).finally(() => { busy = false; });
  });

  // saved charts
  function renderHistory() {
    const h = store.get('bz_hist', []), L = t();
    $('#hist').hidden = !h.length;
    $('#histList').innerHTML = h.map((d, i) => `<li><button type="button" class="ld" data-i="${i}">${d.dm != null ? ch(Bazi.STEMS[d.dm], Bazi.elOf(d.dm)) : ''}<span><b>${esc(d.name || L.unnamed)}</b><small>${esc(fmtDate(d.date))}${d.noTime ? '' : ', ' + esc(d.time)}</small></span></button><button type="button" class="del" data-d="${i}" aria-label="${L.del}">×</button></li>`).join('');
  }
  $('#histList').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const h = store.get('bz_hist', []);
    if (b.dataset.d != null) { h.splice(+b.dataset.d, 1); store.set('bz_hist', h); Motion.haptic('heavy'); Motion.listExit(b.closest('li')).then(renderHistory); return; }
    const d = h[+b.dataset.i]; if (d) { fillForm(d); compute(d); show('res', () => render(last, d, true)); }
  });
  $('#save').onclick = () => {
    if (!lastInput || !last) return;
    const sig = r => [r.date, r.time, r.tz, r.gender, r.name].join('|');
    const h = store.get('bz_hist', []).filter(x => sig(x) !== sig(lastInput));
    h.unshift({ ...lastInput, dm: last.dm });
    store.set('bz_hist', h.slice(0, 30)); renderHistory(); Motion.listEnter($('#histList li')); Motion.haptic('success'); toast(t().saved);
    const sv = $('#save'); sv.classList.remove('done'); void sv.offsetWidth; sv.classList.add('done');
  };
  $('#share').onclick = () => {
    if (!last) return;
    const L = t(), S = Bazi.STEMS, Br = Bazi.BRANCHES, r = last, d = lastInput, now = Date.now(), cy = new Date().getFullYear();
    const text = [`八字 ${d.name || ''}`.trim(), `${fmtDate(d.date)} ${d.noTime ? '' : d.time}`.trim(),
      r.pillars.map(p => `${COL_ZH[p.key]} ${S[p.s]}${Br[p.b]}`).join('   ')].join('\n');
    const cur = r.luck.findIndex((l, i) => l.fromMs <= now && (i === r.luck.length - 1 || now < r.luck[i + 1].fromMs));
    const lk = r.luck[cur], yp = Bazi.yearPillar(cy);
    const placeTxt = d.place && d.place.city ? d.place.city : null;
    const card = () => ShareCard.chartCard({
      L, name: d.name || fmtDate(d.date),
      sub: [d.name ? fmtDate(d.date) : null, d.noTime ? L.noHour : d.time, placeTxt, fmtTz(d.tz).replace(/\s+/g, ' ')].filter(Boolean).join(', '),
      pillars: r.pillars.slice().reverse().map(p => ({ k: COL_ZH[p.key], kl: L[p.key], god: p.god == null ? '日主' : Bazi.GODS_ZH[p.god], stem: S[p.s], branch: Br[p.b], se: Bazi.elOf(p.s), be: Bazi.brEl(p.b), animal: L.animals[p.b], me: p.key === 'day' })),
      dmLine: `${S[r.dm]}  ${L.dmHead(PY_S[r.dm], r.dm % 2 ? L.yin : L.yang, L.el[Bazi.elOf(r.dm)])}`,
      strength: `${L.strLbl}: ${L.strength[r.strength]}`,
      pct: (() => { const tot = r.el.reduce((a, b) => a + b, 0); return r.el.map(v => Math.round(v / tot * 100)); })(),
      fav: r.favorable.map(i => `${EL_CH[i]} ${L.el[i]}`).join(', '),
      luck: [L.luckNow, lk ? `${S[lk.s]}${Br[lk.b]}  ${L.age(lk.age)}, ${lk.year} - ${lk.year + 9}` : '-'],
      year: [`${L.yearNow} ${cy}`, `${S[yp.s]}${Br[yp.b]}  ${Bazi.GODS_ZH[Bazi.tenGod(r.dm, yp.s)]}`],
      note: L.disc
    });
    const slug = (d.name || 'bazi').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'bazi';
    ShareCard.preview(card, `bazi-${slug}.png`, text, L);
  };

  // Android hardware back: result -> form -> exit
  const App = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
  if (App) App.addListener('backButton', () => { if (Motion.sheet.isOpen()) Motion.sheet.close(); else if (window.Coach && Coach.isOpen()) Coach.close(); else if (window.Tour && Tour.isOpen()) Tour.close(); else if (!window.Nav.back()) App.exitApp(); });

  // ---------- detail sheets ----------
  const row = (label, html) => `<div class="sh-row"><span class="sh-l">${label}</span><div class="sh-v">${html}</div></div>`;
  const stemInfo = s => { const L = t(), e = Bazi.elOf(s); return `${ch(Bazi.STEMS[s], e)}<div><b>${PY_S[s]}</b>, ${s % 2 ? L.yin : L.yang} ${L.el[e]}<small>${L.elDesc[e]}</small></div>`; };
  const branchInfo = b => { const L = t(), e = Bazi.brEl(b); return `${ch(Bazi.BRANCHES[b], e)}<div><b>${PY_B[b]}</b>, ${L.animals[b]}, ${L.el[e]}<small>${L.elDesc[e]}</small></div>`; };
  const godInfo = g => { const L = t(); return `<span class="sh-god zh">${Bazi.GODS_ZH[g]}</span><div><b>${L.gods[g]}</b><small>${L.godDesc[g]}</small></div>`; };
  const head = (title, sub, s, b) => `<div class="sh-head"><div class="sh-glyphs">${ch(Bazi.STEMS[s], Bazi.elOf(s))}${ch(Bazi.BRANCHES[b], Bazi.brEl(b))}</div><div><h3>${title}</h3><p>${sub}</p></div></div>`;
  function pillarSheet(key) {
    const L = t(), p = last.pillars.find(x => x.key === key);
    return head(L.pillarOf(key), `${COL_ZH[key]}柱`, p.s, p.b) +
      row(L.stemL, stemInfo(p.s)) +
      row(L.godL, p.god == null ? `<span class="sh-god zh">日主</span><div><b>${L.self}</b><small>${L.dmDesc[p.s]}</small></div>` : godInfo(p.god)) +
      row(L.branchL, branchInfo(p.b)) +
      row(L.hiddenL, `<div class="sh-hid">${p.hidden.map(h => `<span>${ch(Bazi.STEMS[h.s], Bazi.elOf(h.s))}<b class="zh">${Bazi.GODS_ZH[h.god]}</b><small>${L.gods[h.god]}</small></span>`).join('')}</div>`) +
      row(L.meaningL, `<p>${L.palace[key]}</p>`);
  }
  function luckSheet(i) {
    const L = t(), l = last.luck[i];
    return head(`${L.luckOne} ${i + 1}`, `${L.ageL} ${l.age} - ${l.age + 9}, ${l.year} - ${l.year + 9}`, l.s, l.b) +
      row(L.godL, godInfo(l.god)) + row(L.stemL, stemInfo(l.s)) + row(L.branchL, branchInfo(l.b));
  }
  function yearSheet(y) {
    const L = t(), p = Bazi.yearPillar(y), g = Bazi.tenGod(last.dm, p.s);
    return head(`${L.yearOne} ${y}`, `${L.ageL} ${y - Number(lastInput.date.slice(0, 4))}`, p.s, p.b) +
      row(L.godL, godInfo(g)) + row(L.stemL, stemInfo(p.s)) + row(L.branchL, branchInfo(p.b));
  }
  function openFrom(el, kb) {
    if (!last) return;
    const html = el.dataset.pk ? pillarSheet(el.dataset.pk) : el.dataset.lk != null ? luckSheet(+el.dataset.lk) : yearSheet(+el.dataset.yr);
    Motion.sheet.open(html + `<button type="button" class="ghost sh-close">${t().close}</button>`, el, kb);
  }
  const tapTargets = '#chart .col,#luck .tab,#annual .tab';
  $('#resView').addEventListener('click', e => {
    const el = e.target.closest(tapTargets); if (el) return openFrom(el);
    const lg = e.target.closest('#legend [data-e]'); if (lg) Motion.spotlight($('#resView'), lg.dataset.e, lg);
  });
  $('#resView').addEventListener('keydown', e => {
    const el = e.target.closest(tapTargets);
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFrom(el, true); }
  });
  document.addEventListener('click', e => { if (e.target.closest('.sh-close')) Motion.sheet.close(); });
  Motion.details($('.adv'));

  window.BaziApp = { t: () => T[lang], lang: () => lang, applyLang, fmtDate, fmtTz, store, toast };
  applyLang();
  const prev = store.get('bz_last', null);
  if (prev && prev.date) fillForm(prev);
  else place.set({ cc: lang === 'id' || [7, 8, 9].includes(devTz) ? 'ID' : '' });
})();
