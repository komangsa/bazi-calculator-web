/* In-depth Bazi analysis (Ziping school rules) + couple match.
   Pure functions; depends on bazi.js. All text bilingual (id/en). */
(function (root) {
  const B = (typeof Bazi !== 'undefined') ? Bazi : require('./bazi.js');
  const mod = (a, n) => ((a % n) + n) % n;
  const elOf = B.elOf, brEl = B.brEl, S = B.STEMS, BR = B.BRANCHES;

  /* ---------- classical tables ---------- */
  const NOBLE = [[1, 7], [0, 8], [11, 9], [11, 9], [1, 7], [0, 8], [1, 7], [6, 2], [3, 5], [3, 5]]; // 天乙贵人 甲戊庚牛羊…
  const WENCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];                                          // 文昌
  const LU = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0];                                                // 禄
  const REN = { 0: 3, 2: 6, 4: 6, 6: 9, 8: 0 };                                              // 羊刃 (yang stems)
  const PEACH = [9, 6, 3, 0], HORSE = [2, 11, 8, 5], CANOPY = [4, 1, 10, 7];                // by triad b%4
  const PO = [[0, 9], [1, 4], [2, 11], [3, 6], [5, 8], [7, 10]];                             // 六破
  const XING3 = [[2, 5], [5, 8], [8, 2], [1, 10], [10, 7], [7, 1], [0, 3]];                  // 三刑 + 子卯
  const SELF_XING = [4, 6, 9, 11];                                                           // 辰午酉亥 自刑
  const HE5_EL = [2, 3, 4, 0, 1];                                                            // 甲己土 乙庚金 丙辛水 丁壬木 戊癸火
  const triEl = b => [4, 3, 1, 0][b % 4];

  const brRel = (a, b) => {
    const r = [];
    if (a === b) { r.push(SELF_XING.includes(a) ? 'selfxing' : 'same'); return r; }
    if ((a + b) % 12 === 1) r.push('he');
    if (Math.abs(a - b) === 6) r.push('chong');
    if ((a + b) % 12 === 7) r.push('hai');
    if (XING3.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) r.push('xing');
    if (PO.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) r.push('po');
    if (a % 4 === b % 4) r.push('sanhe');
    return r;
  };
  const stemHe = (a, b) => Math.abs(a - b) === 5;
  const stemChong = (a, b) => Math.abs(a - b) === 6 && Math.min(a, b) < 4;

  /* ---------- text ---------- */
  const T = {
    id: {
      el: ['Kayu', 'Api', 'Tanah', 'Logam', 'Air'],
      gods: ['Sahabat', 'Perampas Harta', 'Dewa Makanan', 'Perusak Jabatan', 'Harta Tak Langsung', 'Harta Langsung', 'Tujuh Pembunuh', 'Pejabat Langsung', 'Sumber Tak Langsung', 'Sumber Langsung'],
      pal: { year: 'Tahun', month: 'Bulan', day: 'Hari', hour: 'Jam' },
      palArea: { year: 'leluhur dan masa kecil', month: 'orang tua, saudara, dan karier', day: 'diri dan pasangan', hour: 'anak dan masa tua' },
      rating: ['Sangat baik', 'Baik', 'Campuran', 'Menantang', 'Berat'],
      str: { strong: 'kuat', balanced: 'seimbang', weak: 'lemah' },
      f: {
        ling: ['得令', 'Lahir di musim elemennya', 'Tidak lahir di musim elemennya'],
        di: ['得地', 'Punya akar di cabang bumi', 'Tidak punya akar di cabang bumi'],
        shi: ['得势', 'Didukung batang langit lain', 'Kurang dukungan batang langit']
      },
      fmtLine: (dm, e, s, g) => `${dm} ${e}, kekuatan diri ${s}, ${g}.`,
      structName: ['Struktur Jabatan Mandiri', 'Struktur Pedang Bulan', 'Struktur Dewa Makanan', 'Struktur Perusak Jabatan', 'Struktur Harta Tak Langsung', 'Struktur Harta Langsung', 'Struktur Tujuh Pembunuh', 'Struktur Pejabat Langsung', 'Struktur Sumber Tak Langsung', 'Struktur Sumber Langsung'],
      structTxt: [
        'Cabang bulan adalah 禄 (akar) Day Master. Dikenal sebagai tipe yang membangun hidup dengan usaha sendiri, jarang bergantung pada warisan keluarga. Cocok untuk wirausaha, penjualan, dan profesi yang menghargai kerja pribadi. Energi ini perlu disalurkan lewat Harta atau Jabatan; tanpa itu mudah keras kepala dan boros tenaga.',
        'Cabang bulan adalah 羊刃 Day Master. Kemauan sangat keras, kompetitif, berani ambil risiko. Tradisi mengaitkannya dengan militer, kepolisian, bedah, olahraga, teknik, dan penegakan hukum. Tanpa Tujuh Pembunuh yang mengendalikan (刃杀相济), energinya bisa menjadi konflik, kecelakaan, dan kerugian finansial.',
        'Bakat dan keterampilan menjadi sumber penghidupan. Cocok di kuliner, seni, desain, mengajar, menulis, dan jasa. Rezeki datang stabil dari keahlian; menikmati hidup. Kelemahannya: mudah puas dan kurang ambisi bila terlalu nyaman.',
        'Cerdas, inovatif, tidak suka aturan dan kritis terhadap atasan. Bersinar di media, advokasi, teknologi, seni pertunjukan, konsultan, dan pekerjaan lepas. Tradisi memperingatkan 伤官见官: gesekan dengan atasan, gosip, atau urusan hukum bila bertemu Pejabat Langsung.',
        'Insting dagang kuat, pandai melihat peluang, negosiasi, investasi, dan perdagangan. Murah hati dan pandai bergaul. Uang datang besar tetapi juga mudah keluar; perlu disiplin keuangan.',
        'Teliti, sabar, dan stabil. Rezeki dari gaji tetap, akuntansi, keuangan, administrasi, dan operasional. Kekayaan dibangun pelan lewat ketekunan dan tabungan, bukan spekulasi.',
        'Tumbuh di bawah tekanan dan krisis; pemimpin di situasi sulit. Cocok di militer, hukum, bedah, penegakan aturan, startup, dan restrukturisasi. Butuh pengendali (Dewa Makanan atau Sumber); tanpa itu tekanan berubah menjadi stres, konflik, dan masalah kesehatan.',
        'Integritas, aturan, dan reputasi adalah modal utama. Cocok di pemerintahan, korporasi berjenjang, manajemen, hukum, dan kepatuhan. Naik pelan tapi pasti; reputasi mudah rusak oleh skandal.',
        'Keahlian yang tidak umum. Cocok di riset, kedokteran (termasuk pengobatan tradisional), metafisika, IT, desain, dan psikologi. Paling kuat sebagai spesialis, bukan generalis. Cenderung menyendiri dan rencananya sering berubah.',
        'Belajar dan perlindungan dari orang tua atau mentor. Cocok di pendidikan, akademik, penerbitan, kesehatan, SDM, dan penasihat. Ijazah, sertifikat, dan dokumen membawa keberuntungan. Kelemahannya: bergantung dan lambat bertindak.'
      ],
      climate: { 1: 'Lahir di musim dingin (亥子丑): menurut 调候 (penyesuaian iklim), bagan butuh Api untuk kehangatan.', 4: 'Lahir di musim panas (巳午未): menurut 调候, bagan butuh Air untuk mendinginkan.' },
      climateConflict: 'Catatan: elemen 调候 ini bertentangan dengan metode 扶抑, jadi pengaruhnya campuran.',
      groupName: ['Sahabat (比劫)', 'Output (食伤)', 'Harta (财)', 'Jabatan (官杀)', 'Sumber (印)'],
      groupHi: [
        'Rasa mandiri dan gengsi tinggi, setia pada teman, kompetitif. Tidak suka diatur.',
        'Ekspresif, kreatif, pandai bicara. Butuh ruang untuk menunjukkan bakat.',
        'Praktis, berorientasi hasil dan uang, realistis.',
        'Disiplin, bertanggung jawab, peduli status dan aturan. Mudah merasa tertekan.',
        'Pemikir, suka belajar, penyayang. Butuh dukungan dan rasa aman.'
      ],
      groupNone: [
        'Tanpa Sahabat: jarang dibantu teman sebaya, cenderung berjuang sendiri.',
        'Tanpa Output: ide sering dipendam; butuh saluran kreatif dan kebiasaan berbicara terbuka.',
        'Tanpa Harta: uang bukan motivasi utama, tapi pengelolaan keuangan perlu sistem yang jelas.',
        'Tanpa Jabatan: bebas dari aturan luar, kurang cocok di hierarki kaku; disiplin harus dibangun sendiri.',
        'Tanpa Sumber: belajar secara otodidak, sedikit dukungan dari orang tua atau atasan.'
      ],
      combo: {
        guanyin: ['官印相生', 'Jabatan dan Sumber saling menghidupi', 'Naik lewat organisasi, pemerintahan, atau kualifikasi resmi. Atasan mendukung.'],
        caiguan: ['财官双美', 'Harta dan Jabatan sama-sama tampak', 'Potensi manajemen dan kekayaan yang diakui.'],
        shangguan: ['伤官见官', 'Perusak Jabatan bertemu Pejabat Langsung', 'Gesekan dengan atasan, risiko gosip atau urusan hukum. Lebih aman bekerja mandiri atau di bidang kreatif.'],
        shizhisha: ['食神制杀', 'Dewa Makanan mengendalikan Tujuh Pembunuh', 'Pandai mengelola tekanan dan persaingan; kuat di bidang kompetitif.'],
        caiduo: ['财多身弱', 'Harta banyak, diri lemah', 'Uang terasa berat dan menekan. Lebih aman bergaji tetap atau bermitra; hindari utang dan spekulasi.'],
        shazhong: ['杀重身轻', 'Tekanan berat, diri lemah', 'Beban kerja dan tekanan tinggi. Pendidikan, sertifikasi, dan mentor (Sumber) adalah penyelamat.'],
        bijie: ['比劫夺财', 'Sahabat merebut harta', 'Uang mudah hilang lewat teman, saudara, atau kemitraan. Pisahkan keuangan pribadi dan jangan jadi penjamin.'],
        shangyin: ['伤官配印', 'Perusak Jabatan diimbangi Sumber', 'Bakat yang terdidik: ahli profesional yang dihormati.'],
        xiaoshen: ['枭神夺食', 'Sumber Tak Langsung merebut Dewa Makanan', 'Rencana dan rezeki sering terputus; hati-hati berganti karier mendadak dan jaga pola makan.']
      },
      industries: [
        'pendidikan, penerbitan, tekstil dan fesyen, furnitur, pertanian, herbal dan kesehatan alami',
        'teknologi dan elektronik, energi, media dan hiburan, kecantikan, kuliner, periklanan',
        'properti dan konstruksi, pertambangan, asuransi, SDM dan administrasi, konsultan, pergudangan',
        'keuangan dan perbankan, hukum, teknik mesin, otomotif, perhiasan, perangkat keras',
        'logistik dan perdagangan, pariwisata, komunikasi, perikanan dan minuman, pemasaran, riset'
      ],
      indLine: e => `Bidang yang sejalan dengan elemen pendukung ${e}`,
      careerWho: {
        strongWealth: 'Diri kuat dan Harta mendukung: cocok berbisnis sendiri atau memegang target penjualan.',
        strongOfficer: 'Diri kuat dan Jabatan mendukung: cocok memimpin tim dan memegang kewenangan.',
        strongOutput: 'Diri kuat dan Output mendukung: menghasilkan uang dari ide, karya, dan keahlian.',
        weak: 'Diri lemah: paling berhasil di organisasi yang memberi dukungan, struktur, dan mentor; bangun kualifikasi sebelum mengambil risiko besar.',
        balanced: 'Bagan seimbang: fleksibel di banyak jalur; pilih bidang yang sesuai elemen pendukung.'
      },
      stars: {
        noble: ['天乙贵人', 'Bangsawan Langit', 'Orang penolong muncul di saat sulit; mudah mendapat mentor dan dukungan atasan.'],
        wenchang: ['文昌', 'Bintang Akademik', 'Cerdas belajar, kuat menulis dan ujian; cocok di bidang ilmu dan komunikasi.'],
        peach: ['桃花', 'Bunga Persik', 'Menarik dan populer; bagus untuk pekerjaan publik, tapi godaan asmara lebih tinggi.'],
        horse: ['驿马', 'Kuda Pengembara', 'Banyak bepergian, pindah kerja atau kota; cocok pekerjaan yang mobile atau internasional.'],
        canopy: ['华盖', 'Payung Kebesaran', 'Bakat seni, riset, dan spiritual; sering merasa kesepian atau berbeda.'],
        ren: ['羊刃', 'Pedang Kambing', 'Keberanian dan ketegasan; rawan konflik, cedera, atau operasi bila tidak terkendali.']
      },
      starAt: p => `di pilar ${p}`,
      rel: { he: '六合', chong: '六冲', xing: '相刑', hai: '相害', po: '相破', sanhe: '三合', same: '伏吟', selfxing: '自刑' },
      natal: {
        chong: (a, b, x, y) => `Pilar ${a} dan ${b} saling bentrok (冲): ketidakstabilan dan perubahan di area ${x} serta ${y}.`,
        he: (a, b, x, y) => `Pilar ${a} dan ${b} berpadu (合): dukungan antara ${x} dan ${y}.`,
        xing: (a, b, x, y) => `Pilar ${a} dan ${b} saling menghukum (刑): gesekan, kesehatan, atau urusan hukum terkait ${x} dan ${y}.`,
        hai: (a, b, x, y) => `Pilar ${a} dan ${b} saling merugikan (害): salah paham tersembunyi antara ${x} dan ${y}.`,
        selfxing: (a, b, x, y) => `Cabang pilar ${a} dan ${b} sama dan menghukum diri (自刑): pola emosi atau keputusan yang berulang merugikan diri sendiri, terutama terkait ${x} dan ${y}.`,
        sanhe: (a, b, x, y) => `Pilar ${a} dan ${b} setengah harmoni (半合): kerja sama alami antara ${x} dan ${y}.`,
        stemhe: (a, b) => `Batang ${a} dan ${b} berpadu (天干合): kerja sama dan ikatan erat.`,
        stemchong: (a, b) => `Batang ${a} dan ${b} saling bentrok (天干冲): pertentangan pikiran dan arah.`
      },
      wealth: {
        fav: 'Elemen Harta termasuk pendukung: mengejar uang justru memperkuat hidupmu. Rezeki membesar saat bertemu tahun Harta.',
        unfav: 'Elemen Harta bukan pendukung: mengejar uang secara langsung melelahkan. Rezeki lebih baik datang lewat keahlian (Output) atau posisi (Jabatan).',
        neutral: 'Elemen Harta netral: rezeki mengikuti kerja keras, naik turun mengikuti siklus tahunan.',
        ku: b => `Memiliki gudang harta (财库) di cabang ${b}: kemampuan menyimpan dan mengumpulkan aset.`,
        leak: 'Sahabat/Perampas Harta dominan: hati-hati meminjamkan uang dan berinvestasi bersama teman.'
      },
      love: {
        starM: 'Bintang pasangan pria adalah Harta (正财 istri, 偏财 kekasih).',
        starF: 'Bintang pasangan wanita adalah Jabatan (正官 suami, 七杀 kekasih).',
        none: 'Bintang pasangan tidak tampak di bagan: pernikahan cenderung datang lebih lambat atau melalui perkenalan; tahun dan pilar keberuntungan yang membawa bintang ini mengaktifkan asmara.',
        strong: 'Bintang pasangan kuat: banyak peluang asmara dan pasangan berperan besar dalam hidup.',
        mixed: 'Pejabat Langsung dan Tujuh Pembunuh sama-sama tampak (官杀混杂): tradisi membacanya sebagai kisah asmara yang rumit atau lebih dari satu hubungan serius.',
        rob: 'Perampas Harta kuat pada pria: ada pesaing dalam asmara, dan uang bisa menjadi sumber gesekan dengan pasangan.',
        hurt: 'Perusak Jabatan kuat pada wanita (伤官克夫): tradisi membacanya sebagai kecenderungan mengkritik pasangan; hubungan butuh saling menghormati.',
        palace: (b, g, f) => `Istana pasangan (cabang hari) ${b} berisi ${g}${f ? ', termasuk elemen pendukung: pasangan cenderung membantu.' : '.'}`,
        palaceClash: 'Istana pasangan dibentrok cabang lain: rumah tangga rawan perubahan, jarak, atau konflik; menikah tidak terlalu muda membantu menurut tradisi.',
        peach: 'Ada Bunga Persik di bagan: daya tarik tinggi.',
        years: 'Tahun yang mengaktifkan asmara'
      },
      health: {
        organ: ['hati, empedu, mata, tendon', 'jantung, usus halus, peredaran darah', 'limpa, lambung, pencernaan', 'paru-paru, usus besar, kulit, pernapasan', 'ginjal, kandung kemih, tulang, sistem reproduksi'],
        weak: (e, o) => `Elemen paling lemah adalah ${e}: perhatikan ${o}.`,
        excess: (e, o) => `Elemen ${e} berlebihan: beban pada ${o}.`,
        clash: 'Bentrokan di bagan menambah risiko cedera dan operasi; tahun bentrokan perlu lebih hati-hati.',
        note: 'Ini korespondensi tradisional Lima Elemen dan pengobatan Tiongkok, bukan diagnosis medis.'
      },
      yr: {
        stemFav: (g) => `Batang tahun ${g} adalah elemen pendukung`,
        stemUnfav: (g) => `Batang tahun ${g} adalah elemen yang dihindari`,
        brFav: (g) => `Cabang tahun ${g} adalah elemen pendukung`,
        brUnfav: (g) => `Cabang tahun ${g} adalah elemen yang dihindari`,
        dayChong: 'Membentrok cabang hari (日支逢冲): perubahan rumah, pekerjaan, atau ketegangan dengan pasangan',
        dayHe: 'Berpadu dengan cabang hari: hubungan harmonis, peluang menikah atau kerja sama',
        daySanhe: 'Tiga harmoni dengan cabang hari: dukungan dari lingkungan',
        dayXing: 'Menghukum cabang hari: gesekan, urusan hukum, atau kesehatan',
        dayHai: 'Merugikan cabang hari: salah paham dan pengkhianatan kecil',
        monthChong: 'Membentrok cabang bulan: perubahan karier atau lingkungan kerja, urusan orang tua',
        tsSame: '本命年 (值太岁): tahun shio sendiri, rawan perubahan dan gangguan; jaga kesehatan dan hindari spekulasi',
        tsChong: '冲太岁: bentrok dengan Tai Sui, tahun perubahan besar, pindah, atau konflik',
        tsXing: '刑太岁: urusan hukum, cedera, atau hubungan tegang',
        tsHai: '害太岁: orang di sekitar bisa merugikan, hati-hati dengan janji',
        tsPo: '破太岁: rencana mudah berantakan',
        tkdc: '天克地冲 dengan pilar hari: tahun pergolakan besar (karier, rumah tangga, kesehatan)',
        stemChongDm: 'Batang tahun membentrok Day Master: tekanan dan tantangan pribadi',
        stemHeDm: 'Batang tahun berpadu dengan Day Master: kemitraan, kontrak, atau asmara',
        noble: 'Bangsawan Langit hadir: ada penolong',
        peach: 'Bunga Persik tahun ini: asmara dan popularitas naik',
        horse: 'Kuda Pengembara: perjalanan, pindah kerja atau kota',
        void: 'Cabang tahun kosong (空亡): hasil tertunda, rencana terasa hampa',
        renStrong: 'Tahun 羊刃 untuk diri yang kuat: rawan konflik, cedera, dan kehilangan uang',
        renWeak: 'Tahun 羊刃 menambah kekuatan diri yang lemah',
        luckFav: 'Pilar keberuntungan saat ini mendukung',
        luckUnfav: 'Pilar keberuntungan saat ini kurang mendukung',
        noLuck: 'Sebelum pilar keberuntungan pertama'
      },
      theme: [
        ['Rekan baru, percaya diri, kerja tim', 'Persaingan, pengeluaran naik, rival merebut bagian'],
        ['Langkah berani, jaringan luas', 'Kehilangan uang, perselisihan, dikhianati teman'],
        ['Kreativitas, kenikmatan, kesehatan baik, rezeki dari keahlian', 'Malas, berlebihan, kesempatan terlewat'],
        ['Terobosan, terkenal karena bakat', 'Bentrok dengan atasan, gosip atau hukum, ganti pekerjaan'],
        ['Rezeki tak terduga, peluang bisnis dan investasi', 'Rugi spekulasi, boros, godaan asmara'],
        ['Kenaikan gaji, tabungan, penghasilan stabil', 'Tekanan keuangan, kerja keras demi uang'],
        ['Promosi lewat tantangan, kewenangan', 'Tekanan, konflik, kecelakaan, stres kesehatan'],
        ['Promosi, pengakuan, pernikahan (wanita)', 'Pembatasan, kritik, masalah birokrasi'],
        ['Belajar, keahlian khusus, spiritual', 'Terisolasi, rencana terputus, salah paham'],
        ['Dukungan mentor, kualifikasi, properti dan dokumen', 'Ketergantungan, kemajuan lambat']
      ],
      bestCareer: 'Tahun terbaik untuk karier', bestWealth: 'Tahun terbaik untuk keuangan',
      match: {
        bands: ['Sangat cocok', 'Cocok', 'Cukup', 'Butuh usaha', 'Banyak tantangan'],
        dmHe: (a, b, e) => `Day Master ${a} dan ${b} berpadu (天干五合, menjadi ${e}): ketertarikan alami dan ikatan kuat.`,
        dmChong: (a, b) => `Day Master ${a} dan ${b} saling bentrok (天干冲): cara berpikir bertolak belakang, sering berdebat.`,
        dmSame: 'Day Master satu elemen (比和): saling memahami, tapi bisa bersaing dan sama-sama keras.',
        dmGen: (a, b) => `${a} menghidupi ${b} (相生): satu pihak merawat dan mendukung yang lain.`,
        dmSpouse: 'Pria mengendalikan elemen wanita: sesuai pola bintang pasangan klasik (istri = Harta pria, suami = Jabatan wanita).',
        dmReverse: 'Wanita mengendalikan elemen pria: pola terbalik dari klasik, rawan tarik-menarik kekuasaan.',
        dmCtrl: 'Satu elemen mengendalikan yang lain: perlu kesepakatan peran yang jelas.',
        palace: { he: 'Istana pasangan berpadu (六合): kehidupan rumah tangga harmonis dan saling melengkapi.', sanhe: 'Istana pasangan dalam tiga harmoni (三合): tujuan hidup sejalan.', same: 'Istana pasangan sama: kebiasaan mirip.', selfxing: 'Istana pasangan sama dan saling menghukum diri (自刑): kebiasaan buruk saling diperkuat.', chong: 'Istana pasangan saling bentrok (六冲): sering bertengkar, rawan berpisah atau tinggal berjauhan. Ini faktor paling berat dalam pencocokan tradisional.', xing: 'Istana pasangan saling menghukum (刑): gesekan dan saling menyakiti.', hai: 'Istana pasangan saling merugikan (害): salah paham tersembunyi, rasa tidak dihargai.', po: 'Istana pasangan saling merusak (破): rencana bersama mudah berantakan.' },
        zodiac: { he: (a, b) => `Shio ${a} dan ${b} berpadu (六合): sangat cocok secara tradisional.`, sanhe: (a, b) => `Shio ${a} dan ${b} dalam tiga harmoni (三合): cocok.`, same: (a, b) => `Shio sama (${a}): mirip, kadang bersaing.`, selfxing: (a) => `Shio sama (${a}) yang menghukum diri: mudah saling memancing emosi.`, chong: (a, b) => `Shio ${a} dan ${b} saling bentrok (六冲): kurang cocok secara tradisional.`, hai: (a, b) => `Shio ${a} dan ${b} saling merugikan (害).`, xing: (a, b) => `Shio ${a} dan ${b} saling menghukum (刑).`, po: (a, b) => `Shio ${a} dan ${b} saling merusak (破).` },
        family: { he: 'Cabang bulan berpadu: keluarga kedua pihak mudah akur.', chong: 'Cabang bulan bentrok: keluarga kedua pihak bisa tidak cocok.' },
        comp: (n, p, e) => `Elemen pendukung ${n} (${e}) mengisi ${p}% bagan pasangannya`,
        compGood: 'saling menguatkan', compLow: 'kurang terisi',
        dominantBad: (n, e) => `Elemen dominan pasangan (${e}) adalah elemen yang dihindari ${n}.`,
        starNote: (n, ok) => ok ? `Bintang pasangan ${n} tampak di bagan.` : `Bintang pasangan ${n} lemah: komitmen bisa datang perlahan.`
      }
    },
    en: {
      el: ['Wood', 'Fire', 'Earth', 'Metal', 'Water'],
      gods: ['Friend', 'Rob Wealth', 'Eating God', 'Hurting Officer', 'Indirect Wealth', 'Direct Wealth', 'Seven Killings', 'Direct Officer', 'Indirect Resource', 'Direct Resource'],
      pal: { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' },
      palArea: { year: 'ancestry and childhood', month: 'parents, siblings, and career', day: 'self and spouse', hour: 'children and later life' },
      rating: ['Very good', 'Good', 'Mixed', 'Challenging', 'Difficult'],
      str: { strong: 'strong', balanced: 'balanced', weak: 'weak' },
      f: {
        ling: ['得令', 'Born in its own season', 'Not born in its own season'],
        di: ['得地', 'Rooted in the branches', 'No root in the branches'],
        shi: ['得势', 'Supported by other stems', 'Little support from other stems']
      },
      fmtLine: (dm, e, s, g) => `${dm} ${e}, ${s} self, ${g}.`,
      structName: ['Prosperity Structure', 'Yang Blade Structure', 'Eating God Structure', 'Hurting Officer Structure', 'Indirect Wealth Structure', 'Direct Wealth Structure', 'Seven Killings Structure', 'Direct Officer Structure', 'Indirect Resource Structure', 'Direct Resource Structure'],
      structTxt: [
        'The month branch is the Day Master\'s 禄 (root). A self-made type who rarely relies on family inheritance. Suits entrepreneurship, sales, and professions that reward personal effort. This energy needs Wealth or Officer to channel it; without them it turns stubborn and wasteful.',
        'The month branch is the Day Master\'s 羊刃. Very strong will, competitive, a risk-taker. Tradition links it with the military, police, surgery, sport, engineering, and law enforcement. Without Seven Killings to control it (刃杀相济) the energy turns into conflict, accidents, and financial loss.',
        'Talent and craft are the livelihood. Suits food, arts, design, teaching, writing, and services. Income comes steadily from skill; enjoys life. Weakness: easily content and short on ambition when too comfortable.',
        'Brilliant, innovative, dislikes rules and is critical of bosses. Shines in media, advocacy, technology, performance, consulting, and freelance work. Tradition warns of 伤官见官: friction with superiors, gossip, or legal trouble when Direct Officer appears.',
        'Strong commercial instinct: deals, negotiation, investment, and trading. Generous and sociable. Money comes in big amounts but leaves easily; needs financial discipline.',
        'Careful, patient, and steady. Income from salary, accounting, finance, administration, and operations. Wealth is built slowly through diligence and savings, not speculation.',
        'Thrives under pressure and in crisis; a leader in hard situations. Suits the military, law, surgery, enforcement, startups, and turnarounds. Needs a control (Eating God or Resource); without one the pressure turns into stress, conflict, and health problems.',
        'Integrity, rules, and reputation are the capital. Suits government, corporate ladders, management, law, and compliance. Rises slowly but surely; reputation is easily damaged by scandal.',
        'Unusual expertise. Suits research, medicine (including traditional), metaphysics, IT, design, and psychology. Strongest as a specialist, not a generalist. Tends toward solitude and changing plans.',
        'Learning and protection from parents or mentors. Suits education, academia, publishing, healthcare, HR, and advisory roles. Degrees, certificates, and documents bring luck. Weakness: dependence and slow action.'
      ],
      climate: { 1: 'Born in winter (亥子丑): by 调候 (climate adjustment) the chart needs Fire for warmth.', 4: 'Born in summer (巳午未): by 调候 the chart needs Water to cool it.' },
      climateConflict: 'Note: this climate element conflicts with the 扶抑 method, so its effect is mixed.',
      groupName: ['Companion (比劫)', 'Output (食伤)', 'Wealth (财)', 'Officer (官杀)', 'Resource (印)'],
      groupHi: [
        'Independent and proud, loyal to friends, competitive. Dislikes being controlled.',
        'Expressive, creative, articulate. Needs room to show talent.',
        'Practical, results and money oriented, realistic.',
        'Disciplined, responsible, status and rule conscious. Feels pressure easily.',
        'Thoughtful, studious, caring. Needs support and security.'
      ],
      groupNone: [
        'No Companion: rarely helped by peers, tends to fight alone.',
        'No Output: ideas stay inside; needs a creative outlet and the habit of speaking up.',
        'No Wealth: money is not the main motivator, but finances need a clear system.',
        'No Officer: free of outside rules, less suited to rigid hierarchies; discipline must be self-built.',
        'No Resource: self-taught, little support from parents or superiors.'
      ],
      combo: {
        guanyin: ['官印相生', 'Officer and Resource feed each other', 'Rises through organisations, government, or formal qualifications. Superiors support you.'],
        caiguan: ['财官双美', 'Wealth and Officer both visible', 'Management potential and recognised wealth.'],
        shangguan: ['伤官见官', 'Hurting Officer meets Direct Officer', 'Friction with superiors, risk of gossip or legal trouble. Safer as self-employed or in creative fields.'],
        shizhisha: ['食神制杀', 'Eating God controls Seven Killings', 'Handles pressure and competition skilfully; strong in competitive fields.'],
        caiduo: ['财多身弱', 'Much wealth, weak self', 'Money feels heavy and stressful. Safer on a salary or in partnership; avoid debt and speculation.'],
        shazhong: ['杀重身轻', 'Heavy pressure, weak self', 'High workload and pressure. Education, certification, and mentors (Resource) are the remedy.'],
        bijie: ['比劫夺财', 'Companions rob wealth', 'Money is lost through friends, siblings, or partnerships. Keep finances separate and never act as guarantor.'],
        shangyin: ['伤官配印', 'Hurting Officer balanced by Resource', 'Educated talent: a respected professional expert.'],
        xiaoshen: ['枭神夺食', 'Indirect Resource seizes Eating God', 'Plans and income get interrupted; be careful with sudden career changes and watch your diet.']
      },
      industries: [
        'education, publishing, textiles and fashion, furniture, agriculture, herbal and natural health',
        'technology and electronics, energy, media and entertainment, beauty, food and beverage, advertising',
        'property and construction, mining, insurance, HR and administration, consulting, warehousing',
        'finance and banking, law, mechanical engineering, automotive, jewellery, hardware',
        'logistics and trading, travel, communications, fishery and beverages, marketing, research'
      ],
      indLine: e => `Fields aligned with your favourable element ${e}`,
      careerWho: {
        strongWealth: 'Strong self with supportive Wealth: suited to running your own business or carrying sales targets.',
        strongOfficer: 'Strong self with supportive Officer: suited to leading teams and holding authority.',
        strongOutput: 'Strong self with supportive Output: earns from ideas, work, and expertise.',
        weak: 'Weak self: most successful in organisations that give support, structure, and mentors; build qualifications before taking big risks.',
        balanced: 'Balanced chart: flexible across many paths; choose fields that match the favourable elements.'
      },
      stars: {
        noble: ['天乙贵人', 'Heavenly Noble', 'Helpers appear in hard times; mentors and superiors support you.'],
        wenchang: ['文昌', 'Academic Star', 'Learns fast, strong at writing and exams; suits knowledge and communication fields.'],
        peach: ['桃花', 'Peach Blossom', 'Attractive and popular; good for public-facing work, but romantic temptation is higher.'],
        horse: ['驿马', 'Travelling Horse', 'Much travel, changes of job or city; suits mobile or international work.'],
        canopy: ['华盖', 'Elegant Canopy', 'Talent for art, research, and spirituality; often feels lonely or different.'],
        ren: ['羊刃', 'Yang Blade', 'Courage and decisiveness; prone to conflict, injury, or surgery when unchecked.']
      },
      starAt: p => `in the ${p} pillar`,
      rel: { he: '六合', chong: '六冲', xing: '相刑', hai: '相害', po: '相破', sanhe: '三合', same: '伏吟', selfxing: '自刑' },
      natal: {
        chong: (a, b, x, y) => `${a} and ${b} pillars clash (冲): instability and change in ${x} and ${y}.`,
        he: (a, b, x, y) => `${a} and ${b} pillars combine (合): support between ${x} and ${y}.`,
        xing: (a, b, x, y) => `${a} and ${b} pillars punish each other (刑): friction, health, or legal matters around ${x} and ${y}.`,
        hai: (a, b, x, y) => `${a} and ${b} pillars harm each other (害): hidden misunderstandings between ${x} and ${y}.`,
        selfxing: (a, b, x, y) => `${a} and ${b} pillars share a self-punishing branch (自刑): repeated emotional patterns or decisions that hurt yourself, especially around ${x} and ${y}.`,
        sanhe: (a, b, x, y) => `${a} and ${b} pillars form a half harmony (半合): natural cooperation between ${x} and ${y}.`,
        stemhe: (a, b) => `Stems ${a} and ${b} combine (天干合): cooperation and close bonds.`,
        stemchong: (a, b) => `Stems ${a} and ${b} clash (天干冲): conflicting thoughts and directions.`
      },
      wealth: {
        fav: 'Wealth is a favourable element: pursuing money strengthens your life. Fortune grows in Wealth years.',
        unfav: 'Wealth is not favourable: chasing money directly drains you. Income is better earned through skill (Output) or position (Officer).',
        neutral: 'Wealth is neutral: income follows effort and rises and falls with the yearly cycle.',
        ku: b => `Has a wealth vault (财库) in ${b}: an ability to store and accumulate assets.`,
        leak: 'Companion and Rob Wealth dominate: be careful lending money or investing with friends.'
      },
      love: {
        starM: 'A man\'s spouse star is Wealth (正财 wife, 偏财 lover).',
        starF: 'A woman\'s spouse star is Officer (正官 husband, 七杀 lover).',
        none: 'The spouse star does not show in the chart: marriage tends to come later or through introductions; years and luck pillars that bring this star activate romance.',
        strong: 'Strong spouse star: many romantic chances and a partner who plays a big role in life.',
        mixed: 'Direct Officer and Seven Killings both appear (官杀混杂): tradition reads this as a complicated love life or more than one serious relationship.',
        rob: 'Strong Rob Wealth in a man\'s chart: rivals in love, and money can become a source of friction with the partner.',
        hurt: 'Strong Hurting Officer in a woman\'s chart (伤官克夫): tradition reads this as a tendency to criticise the partner; the relationship needs mutual respect.',
        palace: (b, g, f) => `The spouse palace (day branch) ${b} holds ${g}${f ? ', a favourable element: the partner tends to help you.' : '.'}`,
        palaceClash: 'The spouse palace is clashed by another branch: home life is prone to change, distance, or conflict; tradition advises not marrying too young.',
        peach: 'Peach Blossom in the chart: strong attraction.',
        years: 'Years that activate romance'
      },
      health: {
        organ: ['liver, gallbladder, eyes, tendons', 'heart, small intestine, circulation', 'spleen, stomach, digestion', 'lungs, large intestine, skin, breathing', 'kidneys, bladder, bones, reproductive system'],
        weak: (e, o) => `The weakest element is ${e}: watch the ${o}.`,
        excess: (e, o) => `${e} is excessive: strain on the ${o}.`,
        clash: 'Clashes in the chart add risk of injury and surgery; take extra care in clash years.',
        note: 'Traditional Five Element and Chinese medicine correspondences, not a medical diagnosis.'
      },
      yr: {
        stemFav: g => `Year stem ${g} is a favourable element`,
        stemUnfav: g => `Year stem ${g} is an unfavourable element`,
        brFav: g => `Year branch ${g} is a favourable element`,
        brUnfav: g => `Year branch ${g} is an unfavourable element`,
        dayChong: 'Clashes the day branch (日支逢冲): moves, job changes, or tension with the partner',
        dayHe: 'Combines with the day branch: harmony, chance of marriage or partnership',
        daySanhe: 'Three harmony with the day branch: support from surroundings',
        dayXing: 'Punishes the day branch: friction, legal or health matters',
        dayHai: 'Harms the day branch: misunderstandings and small betrayals',
        monthChong: 'Clashes the month branch: career or workplace change, parents\' matters',
        tsSame: '本命年 (值太岁): your own zodiac year, prone to change and disturbance; guard health and avoid speculation',
        tsChong: '冲太岁: clashes Tai Sui, a year of big change, moves, or conflict',
        tsXing: '刑太岁: legal matters, injury, or strained relations',
        tsHai: '害太岁: people around you may cause harm, be careful with promises',
        tsPo: '破太岁: plans fall apart easily',
        tkdc: '天克地冲 with the day pillar: a year of major upheaval (career, home, health)',
        stemChongDm: 'Year stem clashes the Day Master: pressure and personal challenges',
        stemHeDm: 'Year stem combines with the Day Master: partnerships, contracts, or romance',
        noble: 'Heavenly Noble present: helpers appear',
        peach: 'Peach Blossom year: romance and popularity rise',
        horse: 'Travelling Horse: travel, job or city change',
        void: 'Year branch is void (空亡): delayed results, plans feel empty',
        renStrong: 'Yang Blade year for a strong self: risk of conflict, injury, and money loss',
        renWeak: 'Yang Blade year adds strength to a weak self',
        luckFav: 'Current luck pillar is supportive',
        luckUnfav: 'Current luck pillar is unsupportive',
        noLuck: 'Before the first luck pillar'
      },
      theme: [
        ['New allies, confidence, teamwork', 'Competition, higher spending, rivals take a share'],
        ['Bold moves, wide network', 'Money loss, disputes, betrayal by friends'],
        ['Creativity, enjoyment, good health, income from skill', 'Laziness, excess, missed chances'],
        ['Breakthroughs, fame through talent', 'Clashes with bosses, gossip or legal trouble, job change'],
        ['Windfalls, business and investment chances', 'Speculative loss, overspending, romantic temptation'],
        ['Pay rise, savings, stable income', 'Financial pressure, working hard for money'],
        ['Promotion through challenge, authority', 'Pressure, conflict, accidents, health stress'],
        ['Promotion, recognition, marriage (women)', 'Restrictions, criticism, bureaucratic trouble'],
        ['Study, special skills, spirituality', 'Isolation, interrupted plans, misunderstandings'],
        ['Mentor support, qualifications, property and documents', 'Dependence, slow progress']
      ],
      bestCareer: 'Best years for career', bestWealth: 'Best years for finances',
      match: {
        bands: ['Excellent match', 'Good match', 'Fair', 'Needs work', 'Many challenges'],
        dmHe: (a, b, e) => `Day Masters ${a} and ${b} combine (天干五合, into ${e}): natural attraction and a strong bond.`,
        dmChong: (a, b) => `Day Masters ${a} and ${b} clash (天干冲): opposite ways of thinking, frequent arguments.`,
        dmSame: 'Same Day Master element (比和): mutual understanding, but can compete and both be stubborn.',
        dmGen: (a, b) => `${a} nourishes ${b} (相生): one partner cares for and supports the other.`,
        dmSpouse: 'The man\'s element controls the woman\'s: the classic spouse-star pattern (wife = man\'s Wealth, husband = woman\'s Officer).',
        dmReverse: 'The woman\'s element controls the man\'s: the reverse of the classic pattern, prone to power struggles.',
        dmCtrl: 'One element controls the other: roles need clear agreement.',
        palace: { he: 'Spouse palaces combine (六合): harmonious, complementary home life.', sanhe: 'Spouse palaces in three harmony (三合): life goals align.', same: 'Same spouse palace: similar habits.', selfxing: 'Same spouse palace with self punishment (自刑): bad habits reinforce each other.', chong: 'Spouse palaces clash (六冲): frequent quarrels, risk of separation or living apart. This is the heaviest factor in traditional matching.', xing: 'Spouse palaces punish each other (刑): friction and hurting each other.', hai: 'Spouse palaces harm each other (害): hidden misunderstandings, feeling unappreciated.', po: 'Spouse palaces break each other (破): shared plans fall apart easily.' },
        zodiac: { he: (a, b) => `${a} and ${b} combine (六合): a very good traditional match.`, sanhe: (a, b) => `${a} and ${b} are in three harmony (三合): compatible.`, same: (a) => `Same sign (${a}): alike, sometimes competitive.`, selfxing: (a) => `Same sign (${a}) with self punishment: easily provoke each other.`, chong: (a, b) => `${a} and ${b} clash (六冲): traditionally a poor match.`, hai: (a, b) => `${a} and ${b} harm each other (害).`, xing: (a, b) => `${a} and ${b} punish each other (刑).`, po: (a, b) => `${a} and ${b} break each other (破).` },
        family: { he: 'Month branches combine: both families get along.', chong: 'Month branches clash: the two families may not get along.' },
        comp: (n, p, e) => `${n}'s favourable elements (${e}) fill ${p}% of the partner's chart`,
        compGood: 'mutually strengthening', compLow: 'under-supplied',
        dominantBad: (n, e) => `The partner's dominant element (${e}) is one ${n} should avoid.`,
        starNote: (n, ok) => ok ? `${n}'s spouse star shows in the chart.` : `${n}'s spouse star is weak: commitment may come slowly.`
      }
    }
  };
  const ANIMALS = {
    id: ['Tikus', 'Kerbau', 'Macan', 'Kelinci', 'Naga', 'Ular', 'Kuda', 'Kambing', 'Monyet', 'Ayam', 'Anjing', 'Babi'],
    en: ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig']
  };
  const STRUCT_ZH = ['建禄格', '月刃格', '食神格', '伤官格', '偏财格', '正财格', '七杀格', '正官格', '偏印格', '正印格'];
  const RATING_ZH = ['大吉', '吉', '平', '凶', '大凶'];
  const ratingIdx = s => s >= 3.5 ? 0 : s >= 1.5 ? 1 : s >= -1 ? 2 : s >= -3 ? 3 : 4;

  /* ---------- helpers on a calc() result ---------- */
  function godWeights(r) {
    const w = Array(10).fill(0);
    r.pillars.forEach(p => {
      if (p.key !== 'day') w[p.god] += 1;
      p.hidden.forEach((h, i) => { w[h.god] += (p.hidden.length === 1 ? 1 : [1, .5, .3][i]) * (p.key === 'month' ? 1.5 : 1); });
    });
    return w;
  }
  const visGods = r => r.pillars.filter(p => p.key !== 'day').map(p => p.god);
  const mainGods = r => r.pillars.map(p => p.hidden[0].god);
  const sexIdx = (s, b) => { for (let i = 0; i < 60; i++) if (i % 10 === s && i % 12 === b) return i; return 0; };

  function favSets(r) {
    const mB = r.pillars.find(p => p.key === 'month').b;
    const climate = [11, 0, 1].includes(mB) ? 1 : [5, 6, 7].includes(mB) ? 4 : null;
    const fav = r.favorable.slice();
    let unfav = r.unfavorable.slice();
    if (r.strength === 'balanced' && !unfav.length) {
      const maxE = r.el.indexOf(Math.max(...r.el));
      if (!fav.includes(maxE)) unfav = [maxE];
    }
    let climateConflict = false;
    if (climate != null) {
      if (unfav.includes(climate)) climateConflict = true;
      else if (!fav.includes(climate)) fav.push(climate);
    }
    return { fav, unfav, climate, climateConflict };
  }

  function structure(r) {
    const dm = r.dm, mp = r.pillars.find(p => p.key === 'month');
    const vis = r.pillars.filter(p => p.key !== 'day').map(p => p.s);
    for (const h of mp.hidden) if (vis.includes(h.s) && h.god > 1) return h.god;
    const g0 = mp.hidden[0].god;
    if (g0 > 1) return g0;
    if (mp.b === LU[dm]) return 0;
    if (REN[dm] === mp.b) return 1;
    const o = mp.hidden.find(h => h.god > 1);
    return o ? o.god : 0;
  }

  function natalStars(r) {
    const dm = r.dm, yB = r.pillars[0].b, dB = r.pillars.find(p => p.key === 'day').b, out = [];
    const where = (pred) => r.pillars.filter(p => pred(p.b)).map(p => p.key);
    const add = (k, keys) => { if (keys.length) out.push({ k, at: [...new Set(keys)] }); };
    add('noble', where(b => NOBLE[dm].includes(b)));
    add('wenchang', where(b => b === WENCHANG[dm]));
    add('peach', where(b => b === PEACH[yB % 4] || b === PEACH[dB % 4]));
    add('horse', where(b => b === HORSE[yB % 4] || b === HORSE[dB % 4]));
    add('canopy', where(b => b === CANOPY[yB % 4] || b === CANOPY[dB % 4]));
    if (REN[dm] != null) add('ren', where(b => b === REN[dm]));
    return out;
  }

  function luckAt(r, y) {
    let cur = null;
    r.luck.forEach(l => { if (l.year <= y) cur = l; });
    return cur;
  }

  function scoreYear(r, input, y, fs) {
    const dm = r.dm, P = k => r.pillars.find(p => p.key === k);
    const dB = P('day').b, mB = P('month').b, yB = P('year').b;
    const p = B.yearPillar(y), sE = elOf(p.s), bE = brEl(p.b), notes = [];
    const es = e => fs.fav.includes(e) ? 1 : fs.unfav.includes(e) ? -1 : 0;
    let sc = 0;
    const add = (v, key, arg) => { sc += v; notes.push({ v, key, arg }); };
    if (es(sE) > 0) add(1.5, 'stemFav', sE); else if (es(sE) < 0) add(-1.5, 'stemUnfav', sE);
    if (es(bE) > 0) add(2, 'brFav', bE); else if (es(bE) < 0) add(-2, 'brUnfav', bE);
    const dr = brRel(p.b, dB);
    if (dr.includes('chong')) add(-2, 'dayChong'); else if (dr.includes('he')) add(1, 'dayHe'); else if (dr.includes('sanhe')) add(.5, 'daySanhe');
    if (dr.includes('xing') || dr.includes('selfxing')) add(-1, 'dayXing');
    if (dr.includes('hai')) add(-1, 'dayHai');
    if (brRel(p.b, mB).includes('chong') && mB !== dB) add(-1, 'monthChong');
    const tr = brRel(p.b, yB);
    if (p.b === yB) add(-1.5, 'tsSame');
    else if (tr.includes('chong')) add(-2, 'tsChong');
    else { if (tr.includes('xing')) add(-1, 'tsXing'); if (tr.includes('hai')) add(-1, 'tsHai'); if (tr.includes('po')) add(-.5, 'tsPo'); }
    if (stemChong(p.s, dm) && dr.includes('chong')) add(-2, 'tkdc');
    else if (stemChong(p.s, dm)) add(-.5, 'stemChongDm');
    if (stemHe(p.s, dm)) add(.5, 'stemHeDm');
    if (NOBLE[dm].includes(p.b)) add(1, 'noble');
    if (p.b === PEACH[yB % 4] || p.b === PEACH[dB % 4]) add(0, 'peach');
    if (p.b === HORSE[yB % 4] || p.b === HORSE[dB % 4]) add(0, 'horse');
    const di = sexIdx(dm, dB), xb = (di - di % 10) % 12;
    if (p.b === (xb + 10) % 12 || p.b === (xb + 11) % 12) add(-.5, 'void');
    if (REN[dm] === p.b) { if (r.strength === 'strong') add(-1, 'renStrong'); else if (r.strength === 'weak') add(.5, 'renWeak'); }
    const l = luckAt(r, y);
    if (!l) notes.push({ v: 0, key: 'noLuck' });
    else {
      const lv = .5 * es(elOf(l.s)) + es(brEl(l.b));
      if (lv > 0) add(lv, 'luckFav'); else if (lv < 0) add(lv, 'luckUnfav');
    }
    const god = B.tenGod(dm, p.s);
    return { y, s: p.s, b: p.b, god, score: Math.round(sc * 10) / 10, rating: ratingIdx(sc), notes, favStem: es(sE), favBr: es(bE), luck: l };
  }

  function scoreLuck(r, l, fs) {
    const dB = r.pillars.find(p => p.key === 'day').b, mB = r.pillars.find(p => p.key === 'month').b;
    const es = e => fs.fav.includes(e) ? 1 : fs.unfav.includes(e) ? -1 : 0;
    let sc = 1.5 * es(elOf(l.s)) + 2 * es(brEl(l.b));
    const dr = brRel(l.b, dB);
    const flags = [];
    if (dr.includes('chong')) { sc -= 2; flags.push('dayChong'); } else if (dr.includes('he')) { sc += 1; flags.push('dayHe'); }
    if (brRel(l.b, mB).includes('chong') && mB !== dB) { sc -= 1; flags.push('monthChong'); }
    if (stemChong(l.s, r.dm)) { sc -= .5; flags.push('stemChongDm'); }
    return { score: Math.round(sc * 10) / 10, rating: ratingIdx(sc), flags };
  }

  /* ---------- main analysis ---------- */
  function analyze(r, input, lang, nowYear) {
    const L = T[lang] || T.id, AN = ANIMALS[lang] || ANIMALS.id;
    const dm = r.dm, dmE = elOf(dm), resE = (dmE + 4) % 5;
    const P = k => r.pillars.find(p => p.key === k);
    const mp = P('month'), dp = P('day');
    const fs = favSets(r);
    const w = godWeights(r), grp = [0, 1, 2, 3, 4].map(g => w[2 * g] + w[2 * g + 1]);
    const gTot = grp.reduce((a, b) => a + b, 0) || 1, gPct = grp.map(v => Math.round(v / gTot * 100));
    const vis = visGods(r), main = mainGods(r), present = g => vis.includes(g) || main.includes(g);
    const elName = e => L.el[e];
    const list = a => a.map(elName).join(', ');

    // summary
    const deLing = [dmE, resE].includes(brEl(mp.b));
    const deDi = r.pillars.some(p => p.hidden.some(h => elOf(h.s) === dmE));
    const deShi = r.pillars.filter(p => p.key !== 'day' && [dmE, resE].includes(elOf(p.s))).length >= 2;
    const st = structure(r);
    const factors = [['ling', deLing], ['di', deDi], ['shi', deShi]].map(([k, ok]) => ({ zh: L.f[k][0], ok, text: L.f[k][ok ? 1 : 2] }));
    const summary = {
      line: L.fmtLine(S[dm], elName(dmE), L.str[r.strength], `${STRUCT_ZH[st]} (${L.structName[st]})`),
      factors, struct: { idx: st, zh: STRUCT_ZH[st], name: L.structName[st], text: L.structTxt[st] },
      fav: fs.fav, unfav: fs.unfav,
      climate: fs.climate != null ? L.climate[fs.climate] + (fs.climateConflict ? ' ' + L.climateConflict : '') : null
    };

    // personality: dominant and missing ten-god groups
    const order = [0, 1, 2, 3, 4].sort((a, b) => grp[b] - grp[a]);
    const personality = { groups: grp.map((v, i) => ({ name: L.groupName[i], pct: gPct[i] })), lines: [L.groupHi[order[0]]] };
    if (gPct[order[1]] >= 20) personality.lines.push(L.groupHi[order[1]]);
    grp.forEach((v, i) => { if (v < 0.35) personality.lines.push(L.groupNone[i]); });

    // natal combos
    const combos = [];
    const C = k => combos.push({ k, zh: L.combo[k][0], name: L.combo[k][1], text: L.combo[k][2], tone: ['shangguan', 'caiduo', 'shazhong', 'bijie', 'xiaoshen'].includes(k) ? -1 : 1 });
    if ((present(7) || present(6)) && (present(9) || present(8)) && r.strength !== 'strong') C('guanyin');
    if ((present(5) || present(4)) && (present(7)) && r.strength !== 'weak') C('caiguan');
    if (vis.includes(3) && vis.includes(7)) C('shangguan');
    if (present(2) && present(6)) C('shizhisha');
    if (r.strength === 'weak' && grp[2] >= Math.max(...grp) - 0.01) C('caiduo');
    if (r.strength === 'weak' && grp[3] >= Math.max(...grp) - 0.01) C('shazhong');
    if (r.strength === 'strong' && grp[0] >= 3 && grp[2] > 0) C('bijie');
    if (present(3) && present(9)) C('shangyin');
    if (vis.includes(8) && present(2)) C('xiaoshen');

    // stars
    const stars = natalStars(r).map(s => ({ zh: L.stars[s.k][0], name: L.stars[s.k][1], text: L.stars[s.k][2], at: s.at.map(k => L.pal[k]).join(', '), k: s.k }));

    // natal relations
    const natal = [];
    const ps = r.pillars;
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], rel = brRel(a.b, b.b), A = L.pal[a.key], Bn = L.pal[b.key], x = L.palArea[a.key], y = L.palArea[b.key];
      ['chong', 'he', 'xing', 'hai', 'selfxing', 'sanhe'].forEach(k => { if (rel.includes(k) && !(k === 'sanhe' && rel.includes('he'))) natal.push({ tone: ['he', 'sanhe'].includes(k) ? 1 : -1, zh: `${BR[a.b]}${BR[b.b]}${k === 'sanhe' ? '半合' : L.rel[k]}`, text: L.natal[k](A, Bn, x, y) }); });
      if (stemHe(a.s, b.s)) natal.push({ tone: 1, zh: `${S[a.s]}${S[b.s]}合`, text: L.natal.stemhe(A, Bn) });
      if (stemChong(a.s, b.s)) natal.push({ tone: -1, zh: `${S[a.s]}${S[b.s]}冲`, text: L.natal.stemchong(A, Bn) });
    }

    // years
    const ny = nowYear || new Date().getFullYear();
    const years = [];
    for (let y = ny - 1; y <= ny + 11; y++) {
      const yi = scoreYear(r, input, y, fs);
      yi.theme = L.theme[yi.god][0]; yi.lean = yi.favStem > 0 ? 'up' : yi.favStem < 0 ? 'down' : 'mid';
      yi.risk = L.theme[yi.god][1];
      yi.reasons = yi.notes.map(n => ({ v: n.v, t: typeof L.yr[n.key] === 'function' ? L.yr[n.key](`${n.key.startsWith('stem') ? S[B.yearPillar(y).s] : BR[B.yearPillar(y).b]} (${elName(n.arg)})`) : L.yr[n.key] }));
      yi.label = L.rating[yi.rating]; yi.zh = RATING_ZH[yi.rating];
      years.push(yi);
    }
    const future = years.filter(y => y.y >= ny && y.y <= ny + 10);
    const best = future.slice().sort((a, b) => b.score - a.score).filter(y => y.score >= 1.5).slice(0, 3).map(y => y.y).sort();
    const worst = future.slice().sort((a, b) => a.score - b.score).filter(y => y.score <= -1).slice(0, 3).map(y => y.y).sort();

    const luck = r.luck.map(l => { const s = scoreLuck(r, l, fs); return { ...l, ...s, label: L.rating[s.rating], zh: RATING_ZH[s.rating], theme: L.theme[l.god][fs.fav.includes(elOf(l.s)) ? 0 : fs.unfav.includes(elOf(l.s)) ? 1 : 0] }; });

    // career
    const careerWho = r.strength === 'weak' ? L.careerWho.weak : r.strength === 'balanced' ? L.careerWho.balanced
      : fs.fav.includes((dmE + 2) % 5) && grp[2] >= grp[3] ? L.careerWho.strongWealth
        : fs.fav.includes((dmE + 3) % 5) && grp[3] > 0.5 ? L.careerWho.strongOfficer : L.careerWho.strongOutput;
    const careerGodOk = g => [2, 3, 4, 5, 6, 7].includes(g);
    const careerYears = future.filter(y => y.score >= 1 && careerGodOk(y.god) && y.favStem >= 0).sort((a, b) => b.score - a.score).slice(0, 4).map(y => y.y).sort();
    const career = {
      who: careerWho,
      fields: fs.fav.map(e => ({ e, text: L.industries[e] })),
      indLine: L.indLine(list(fs.fav)),
      combos, stars: stars.filter(s => ['noble', 'wenchang', 'horse', 'canopy', 'ren'].includes(s.k)),
      years: careerYears, yearsLabel: L.bestCareer
    };

    // wealth
    const wE = (dmE + 2) % 5;
    const wealth = { lines: [fs.fav.includes(wE) ? L.wealth.fav : fs.unfav.includes(wE) ? L.wealth.unfav : L.wealth.neutral] };
    r.pillars.forEach(p => { if ([1, 4, 7, 10].includes(p.b) && B.HIDDEN[p.b].some(h => elOf(h) === wE)) wealth.lines.push(L.wealth.ku(BR[p.b])); });
    if (grp[0] >= Math.max(...grp) - 0.01 && grp[0] > 2) wealth.lines.push(L.wealth.leak);
    wealth.years = future.filter(y => y.score >= 1 && (elOf(y.s) === wE || brEl(y.b) === wE || [2, 3].includes(y.god)) && fs.fav.includes(wE) || (y.score >= 1.5 && [4, 5].includes(y.god))).slice(0, 4).map(y => y.y);
    wealth.yearsLabel = L.bestWealth;

    // love
    const male = input.gender !== 'F', starGods = male ? [4, 5] : [6, 7];
    const starW = w[starGods[0]] + w[starGods[1]];
    const love = { lines: [male ? L.love.starM : L.love.starF] };
    if (starW < 0.35) love.lines.push(L.love.none); else if (starW >= 2.5) love.lines.push(L.love.strong);
    if (!male && present(6) && present(7) && (vis.includes(6) || vis.includes(7))) love.lines.push(L.love.mixed);
    if (male && w[1] >= 1.5) love.lines.push(L.love.rob);
    if (!male && w[3] >= 1.5) love.lines.push(L.love.hurt);
    love.lines.push(L.love.palace(`${BR[dp.b]} (${AN[dp.b]})`, dp.hidden.map(h => `${S[h.s]} ${L.gods[h.god]}`).join(', '), fs.fav.includes(brEl(dp.b))));
    if (r.pillars.some(p => p.key !== 'day' && brRel(p.b, dp.b).includes('chong'))) love.lines.push(L.love.palaceClash);
    if (stars.some(s => s.k === 'peach')) love.lines.push(L.love.peach);
    love.years = future.filter(y => starGods.includes(y.god) || y.notes.some(n => ['peach', 'dayHe', 'stemHeDm'].includes(n.key))).map(y => y.y).slice(0, 5);
    love.yearsLabel = L.love.years;

    // health
    const tot = r.el.reduce((a, b) => a + b, 0), pct = r.el.map(v => v / tot);
    const minE = pct.indexOf(Math.min(...pct)), maxE = pct.indexOf(Math.max(...pct));
    const health = { lines: [L.health.weak(elName(minE), L.health.organ[minE])] };
    if (pct[maxE] > 0.32) health.lines.push(L.health.excess(elName(maxE), L.health.organ[maxE]));
    if (natal.some(n => /冲|刑/.test(n.zh))) health.lines.push(L.health.clash);
    health.note = L.health.note;

    return { summary, personality, career, wealth, love, health, stars, natal, years, luck, best, worst, nowYear: ny };
  }

  /* ---------- couple match ---------- */
  function match(a, b, ia, ib, lang) {
    const L = T[lang] || T.id, M = L.match, AN = ANIMALS[lang] || ANIMALS.id;
    const nA = ia.name || 'A', nB = ib.name || 'B';
    const items = []; let score = 55;
    const add = (pts, zh, text, group) => { score += pts; items.push({ pts, zh, text, group }); };
    const eA = elOf(a.dm), eB = elOf(b.dm);
    // 1 day masters
    if (stemHe(a.dm, b.dm)) add(15, `${S[a.dm]}${S[b.dm]}合`, M.dmHe(S[a.dm], S[b.dm], L.el[HE5_EL[Math.min(a.dm, b.dm)]]), 'dm');
    if (stemChong(a.dm, b.dm)) add(-10, `${S[a.dm]}${S[b.dm]}冲`, M.dmChong(S[a.dm], S[b.dm]), 'dm');
    if (eA === eB) add(4, '比和', M.dmSame, 'dm');
    else if ((eA + 1) % 5 === eB) add(8, '相生', M.dmGen(`${S[a.dm]} ${L.el[eA]}`, `${S[b.dm]} ${L.el[eB]}`), 'dm');
    else if ((eB + 1) % 5 === eA) add(8, '相生', M.dmGen(`${S[b.dm]} ${L.el[eB]}`, `${S[a.dm]} ${L.el[eA]}`), 'dm');
    else {
      const aCtrlB = (eA + 2) % 5 === eB, mA = ia.gender !== 'F', mB = ib.gender !== 'F';
      if (mA !== mB) {
        const maleCtrl = (mA && aCtrlB) || (mB && !aCtrlB);
        if (maleCtrl) add(10, '妻财夫官', M.dmSpouse, 'dm'); else add(-6, '逆克', M.dmReverse, 'dm');
      } else add(-3, '相克', M.dmCtrl, 'dm');
    }
    // 2 spouse palaces
    const dA = a.pillars.find(p => p.key === 'day').b, dB = b.pillars.find(p => p.key === 'day').b;
    const pr = brRel(dA, dB), PP = { he: 15, sanhe: 8, same: 3, selfxing: -4, chong: -15, xing: -8, hai: -8, po: -4 };
    ['he', 'chong', 'sanhe', 'same', 'selfxing', 'xing', 'hai', 'po'].forEach(k => { if (pr.includes(k) && !(k === 'sanhe' && pr.includes('he'))) add(PP[k], `${BR[dA]}${BR[dB]}${L.rel[k]}`, M.palace[k], 'palace'); });
    // 3 zodiac (year branches)
    const yA = a.pillars[0].b, yB = b.pillars[0].b, zr = brRel(yA, yB), ZP = { he: 8, sanhe: 7, same: 2, selfxing: -3, chong: -8, hai: -5, xing: -4, po: -2 };
    ['he', 'chong', 'sanhe', 'same', 'selfxing', 'hai', 'xing', 'po'].forEach(k => { if (zr.includes(k) && !(k === 'sanhe' && zr.includes('he'))) add(ZP[k], `${BR[yA]}${BR[yB]}${L.rel[k]}`, M.zodiac[k](AN[yA], AN[yB]), 'zodiac'); });
    // 4 families (month branches)
    const mA = a.pillars[1].b, mBr = b.pillars[1].b, fr = brRel(mA, mBr);
    if (fr.includes('he')) add(3, `${BR[mA]}${BR[mBr]}合`, M.family.he, 'family');
    if (fr.includes('chong')) add(-3, `${BR[mA]}${BR[mBr]}冲`, M.family.chong, 'family');
    // 5 element complement
    const fsA = favSets(a), fsB = favSets(b);
    const share = (fav, r) => { const t = r.el.reduce((x, y) => x + y, 0); return Math.round(fav.reduce((s, e) => s + r.el[e], 0) / t * 100); };
    const cA = share(fsA.fav, b), cB = share(fsB.fav, a);
    const pts = c => Math.max(-5, Math.min(7, Math.round((c - 40) / 4)));
    add(pts(cA), '用神互补', M.comp(nA, cA, fsA.fav.map(e => L.el[e]).join(', ')) + (cA >= 45 ? `, ${M.compGood}.` : cA < 35 ? `, ${M.compLow}.` : '.'), 'element');
    add(pts(cB), '用神互补', M.comp(nB, cB, fsB.fav.map(e => L.el[e]).join(', ')) + (cB >= 45 ? `, ${M.compGood}.` : cB < 35 ? `, ${M.compLow}.` : '.'), 'element');
    const domB = b.el.indexOf(Math.max(...b.el)), domA = a.el.indexOf(Math.max(...a.el));
    if (fsA.unfav.includes(domB)) add(-3, '忌神', M.dominantBad(nA, L.el[domB]), 'element');
    if (fsB.unfav.includes(domA)) add(-3, '忌神', M.dominantBad(nB, L.el[domA]), 'element');
    // 6 spouse star notes (no score)
    const starOk = (r, g) => { const w = godWeights(r), sg = g !== 'F' ? [4, 5] : [6, 7]; return w[sg[0]] + w[sg[1]] >= 0.35; };
    const notes = [M.starNote(nA, starOk(a, ia.gender)), M.starNote(nB, starOk(b, ib.gender))];
    score = Math.max(5, Math.min(98, Math.round(score)));
    const band = score >= 80 ? 0 : score >= 66 ? 1 : score >= 52 ? 2 : score >= 40 ? 3 : 4;
    return { score, band, bandLabel: M.bands[band], items, notes };
  }

  const api = { analyze, match, brRel, stemHe, stemChong, structure, favSets, natalStars, scoreYear, T, STRUCT_ZH, RATING_ZH };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BaziAnalysis = api;
})(typeof window !== 'undefined' ? window : globalThis);
