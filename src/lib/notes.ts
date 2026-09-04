// Catatan presenter per langkah — panduan penyampaian (bukan naskah).
// Struktur: NOTE_PLAN[section][step] = { t: judul langkah, c: cue penyampaian }.
// Dipakai oleh NotesPanel (toggle [N]) — murni alat bantu presenter,
// tidak pernah tampil ke audiens kecuali layar diproyeksikan bersama panel.

export interface StepNote {
  t: string;
  c: string;
}

export const NOTE_PLAN: StepNote[][] = [
  [
    // 00 OUVERTURE — 2 langkah
    {
      t: "Judul — atmosfer pembuka",
      c: "Diam saat judul muncul; biarkan mata ruangan menyesuaikan ke layar.",
    },
    {
      t: "Kredit & gerbang",
      c: "Sebut Kelompok 6 · PDB 93 singkat, langsung Space ke video.",
    },
  ],
  [
    // 01 GUEST LECTURER — 4 langkah
    {
      t: "Pembuka narasumber — spotlight",
      c: "Ruang gelap. Quote muncul dan spotlight otomatis menyala setelah 1 detik.",
    },
    {
      t: "Penyingkapan tirai teater",
      c: "Layar hitam runtuh ke bawah; tirai merah beludru tertutup siap dibuka.",
    },
    {
      t: "Tirai dibuka — video berjalan",
      c: "Tirai tersibak dramatis, video diputar. Tekan Shift+S bila waktu mepet.",
    },
    {
      t: "Tirai menutup — jembatan ke latar",
      c: "Kutipan penutup narasumber sebagai jembatan menuju Anatomi KTI.",
    },
  ],
  [
    // 02 LATAR BELAKANG — 4 langkah
    {
      t: "Pernyataan kunci — kerangka logis",
      c: "Tekankan kutipan sub-bab 1.1: struktur sebagai kerangka logis alur pemikiran penulis.",
    },
    {
      t: "FAKTA 01 — Komunikasi Akademik",
      c: "KTI alat kembang berpikir kritis di tengah tuntutan publikasi bereputasi (Musdalifah et al., 2025).",
    },
    {
      t: "FAKTA 02 — Hambatan Mahasiswa",
      c: "Banyak mahasiswa terhambat karena minim penguasaan struktur & latihan (Baharuddin et al., 2025).",
    },
    {
      t: "FAKTA 03 — Kerangka Logis",
      c: "Struktur bukan sebatas teknis, melainkan esensial dalam membentuk argumen ilmiah yang sahih.",
    },
  ],
  [
    // 03 HAKIKAT & KARAKTERISTIK — 8 langkah
    {
      t: "Definisi — KBBI Daring (2024)",
      c: "Pijakan resmi Badan Bahasa: patuh kaidah keilmuan & hasil pengamatan/penelitian.",
    },
    {
      t: "Definisi — Wulandari et al. (2024)",
      c: "Sorot pemecahan masalah tertentu berbasis data primer dan data sekunder.",
    },
    {
      t: "Definisi — Samal & Ardianto (2025)",
      c: "Komunikasi akademik tertulis yang menyajikan gagasan rasional/investigasi empiris terbuka.",
    },
    {
      t: "Karakteristik 01 — Objektif",
      c: "Berdasarkan data faktual/empiris, bukan opini pribadi emosional.",
    },
    {
      t: "Karakteristik 02 — Logis & Rasional",
      c: "Alur penalaran runtut, koheren, dan masuk akal (induktif maupun deduktif).",
    },
    {
      t: "Karakteristik 03 — Sistematis",
      c: "Pola organisasi terstruktur, baku, dan berkesinambungan antarbab.",
    },
    {
      t: "Karakteristik 04 — Cendekia & Lugas",
      c: "Bahasa baku, efektif, istilah teknis tepat, hindari ambiguitas atau metafora berlebihan.",
    },
    {
      t: "Karakteristik 05 — Verifikatif",
      c: "Prosedur transparan sehingga memungkinkan replikasi oleh peneliti lain.",
    },
  ],
  [
    // 04 ANATOMY THEATER — 9 langkah
    {
      t: "Peta tubuh — overview",
      c: "Tiga rongga anatomi KTI: preliminaries, body text, dan postliminaries.",
    },
    {
      t: "Preliminaries",
      c: "5 komponen awal: judul, pengesahan, abstrak & kata kunci, pengantar, daftar navigasi.",
    },
    {
      t: "Body Text",
      c: "Rongga argumen utama: standar baku lima bab (BAB I–V).",
    },
    {
      t: "BAB I — Pendahuluan",
      c: "Piramida terbalik, batasan, rumusan 5W1H, korespondensi tujuan 1:1, manfaat teoretis-praktis.",
    },
    {
      t: "BAB II — Kajian Pustaka",
      c: "Teori mutakhir, pemetaan riset terdahulu untuk novelty, kerangka berpikir, hipotesis statistik.",
    },
    {
      t: "BAB III — Metodologi Penelitian",
      c: "Desain, tempat/waktu, populasi-sampel, instrumen valid/reliabel, teknik analisis data.",
    },
    {
      t: "BAB IV — Hasil & Pembahasan",
      c: "Bagian paling kritis: data objektif temuan dipertemukan dalam dialektika teori Bab II.",
    },
    {
      t: "BAB V — Simpulan & Saran",
      c: "Simpulan substantif menjawab masalah (bukan data mentah) + rekomendasi operasional.",
    },
    {
      t: "Postliminaries",
      c: "Daftar pustaka alfabetis baku (APA/Harvard/IEEE), lampiran data mentah, riwayat hidup.",
    },
  ],
  [
    // 05 SESI INTERAKTIF — 5 langkah
    {
      t: "Kalimat pemantik",
      c: "Ajak audiens menyiapkan ponsel untuk menguji pemahaman sistematika KTI.",
    },
    {
      t: "Q1 — voting live",
      c: "Perbedaan artikel jurnal vs makalah: struktur IMRaD & novelty vs tugas konseptual.",
    },
    {
      t: "Q1 — reveal",
      c: "Bahas hasil voting dan kuatkan konsep format IMRaD dari Tabel 2.",
    },
    {
      t: "Q2 — voting live",
      c: "Letak kontribusi ilmiah & orisinalitas utama peneliti (Pembahasan Bab IV).",
    },
    {
      t: "Q2 — reveal & ekspor",
      c: "Bongkar miskonsepsi bahwa tumpukan data mentah bukanlah kontribusi sebelum dibahas kritis.",
    },
  ],
  [
    // 06 VARIASI KTI — 6 langkah
    {
      t: "Galeri variasi",
      c: "Sistematika menyesuaikan wadah: data Tabel 2 karya tulis ilmiah.",
    },
    {
      t: "Makalah",
      c: "Format ringkas Bab I–III (10–20 hlm) untuk kajian konseptual tugas kuliah.",
    },
    {
      t: "Artikel Jurnal",
      c: "Format IMRaD padat (4.000–7.000 kata) tanpa nomor bab Romawi, orientasi novelty.",
    },
    {
      t: "Skripsi / Tesis",
      c: "Format 5 bab lengkap menyeluruh dengan pengujian instrumen dan metodologi rinci.",
    },
    {
      t: "Proposal PKM",
      c: "Ketat maksimal 10 halaman isi inti sesuai format administratif Pedoman Simbelmawa.",
    },
    {
      t: "Mode komparasi [B]",
      c: "Bandingkan format struktur dan karakteristik kunci antargenre secara simultan.",
    },
  ],
  [
    // 07 KAIDAH & ETIKA — 3 langkah
    {
      t: "Penerapan EYD Edisi V",
      c: "Kepatuhan Kepmendikbudristek No. 0424/P/2022: huruf miring untuk istilah asing & tanda baca.",
    },
    {
      t: "Struktur Kalimat Efektif",
      c: "Subjek-predikat tegas, hemat kata, hindari kalimat menggantung (Jumadi et al., 2024).",
    },
    {
      t: "Integritas & Anti-Plagiarisme",
      c: "Etika perujukan, teknik parafrasa, dan penggunaan Mendeley/Zotero (Farida, 2024).",
    },
  ],
  [
    // 08 PENUTUP — 6 langkah
    {
      t: "Simpulan 1 — Hakikat KTI",
      c: "Pemecahan masalah dengan metode ilmiah yang dapat dipertanggungjawabkan.",
    },
    {
      t: "Simpulan 2 — Tiga Rongga Anatomi",
      c: "Bagian awal (preliminaries), inti (body text 5 bab), dan akhir (postliminaries).",
    },
    {
      t: "Simpulan 3 — Fleksibilitas Wadah",
      c: "Adaptasi struktur pada makalah, artikel jurnal IMRaD, hingga proposal PKM.",
    },
    {
      t: "Simpulan 4 — Bahasa & Etika",
      c: "Keharmonisan logika antarbab, EYD V, kalimat efektif, dan integritas sitasi.",
    },
    {
      t: "Callback kalimat pembuka",
      c: "'Hari ini kita SUDAH bedah anatominya' — beri penekanan pada kata SUDAH.",
    },
    {
      t: "Terima kasih & tanya jawab",
      c: "Buka sesi diskusi kelas PDB 93; rekap statistik sesi tampil di layar.",
    },
  ],
];

/** Catatan langkah tertentu — fallback bila di luar jangkauan. */
export function stepNote(
  section: number,
  step: number,
): { t: string; c: string } {
  const act = NOTE_PLAN[section];
  if (!act) return { t: "—", c: "Tidak ada catatan untuk babak ini." };
  return (
    act[Math.min(step, act.length - 1)] ?? {
      t: "—",
      c: "Tidak ada catatan untuk langkah ini.",
    }
  );
}
