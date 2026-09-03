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
    // 01 GUEST LECTURER — 3 langkah
    {
      t: "Pembuka narasumber",
      c: "Perkenalkan guest lecturer dan topiknya dalam dua kalimat.",
    },
    {
      t: "Video berjalan",
      c: "Putar penuh ±10 menit. Shift+S bila waktu mepet.",
    },
    {
      t: "Jembatan ke latar",
      c: "Satu kalimat kunci dari video, arahkan ke 'mengapa KTI penting'.",
    },
  ],
  [
    // 02 LATAR BELAKANG — 4 langkah
    {
      t: "Kalimat pemantik",
      c: "Tanya: siapa sudah pernah menulis KTI? Tunggu dua jawaban.",
    },
    {
      t: "FAKTA 01 — Struktur",
      c: "Struktur bukan formalitas — alat berpikir. Beri napas setelah angka.",
    },
    {
      t: "FAKTA 02 — Konvensi",
      c: "Kontras singkat: tulisan ilmiah vs postingan media sosial.",
    },
    {
      t: "FAKTA 03 — Konsekuensi",
      c: "Naikkan tempo — 'maka kita bedah tubuhnya' — masuk ACT.03.",
    },
  ],
  [
    // 03 HAKIKAT & KARAKTERISTIK — 8 langkah
    {
      t: "Definisi — KBBI Edisi V",
      c: "Baca perlahan; definisi resmi = pijakan bersama ruangan.",
    },
    {
      t: "Definisi — Wulandari dkk.",
      c: "Sorot frasa 'metode ilmiah' sebagai pembeda inti.",
    },
    {
      t: "Definisi — Samal & Ardianto",
      c: "Tiga definisi = tiga sudut satu gunung; rangkum sekali.",
    },
    {
      t: "Karakteristik 01 — Objektif",
      c: "Contoh cepat: data vs opini di kolom komentar.",
    },
    {
      t: "Karakteristik 02 — Logis",
      c: "Analogi rantai — klaim terhubung, tak ada yang menggantung.",
    },
    {
      t: "Karakteristik 03 — Sistematis",
      c: "Teaser: 'struktur ini kita bedah di babak berikutnya.'",
    },
    {
      t: "Karakteristik 04 — Cendekia",
      c: "Sentuh bahasa baku — jembatan ke kaidah ACT.07.",
    },
    {
      t: "Karakteristik 05 — Verifikatif",
      c: "Kalimat pamungkas: yang tak teruji bukan ilmu.",
    },
  ],
  [
    // 04 ANATOMY THEATER — 9 langkah
    {
      t: "Peta tubuh — overview",
      c: "Perkenalkan metode: tubuh KTI dibaca sebagai anatomi.",
    },
    {
      t: "Preliminaries",
      c: "Sampul & kata pengantar — mahkota sebelum isi.",
    },
    {
      t: "Body Text",
      c: "Fokus ke poros tengah; BAB I–V siap dibedah satu-satu.",
    },
    {
      t: "BAB I — Pendahuluan",
      c: "Empat pintu masuk argumen; semua bab wajib menepatinya.",
    },
    {
      t: "BAB II — Tinjauan Pustaka",
      c: "Dialog dengan literatur — bukan tumpukan kutipan.",
    },
    {
      t: "BAB III — Metode",
      c: "Jelaskan desain agar temuan bisa direplikasi.",
    },
    {
      t: "BAB IV — Hasil & Pembahasan",
      c: "Momen kontribusi ilmiah — penekanan terpanjang di sini.",
    },
    {
      t: "BAB V — Simpulan & Saran",
      c: "Janji BAB I ditepati; nada final dan tegas.",
    },
    {
      t: "Postliminaries",
      c: "Daftar pustaka & lampiran — etika pengutipan ditutup di sini.",
    },
  ],
  [
    // 05 SESI INTERAKTIF — 5 langkah
    {
      t: "Kalimat pemantik",
      c: "Umpan 'test insting' — pastikan HP siap sebelum lanjut.",
    },
    {
      t: "Q1 — voting live",
      c: "Pantau responden & perangkat; [F] fallback bila macet, [R] reset.",
    },
    {
      t: "Q1 — reveal",
      c: "Bacakan persen benar; bahas mayoritas yang keliru lebih dulu.",
    },
    {
      t: "Q2 — voting live",
      c: "Naikkan energi: 'pertanyaan terakhir — jangan kelewat.'",
    },
    {
      t: "Q2 — reveal & ekspor",
      c: "Reveal, lalu [E] ekspor CSV sebagai lampiran laporan.",
    },
  ],
  [
    // 06 VARIASI KTI — 6 langkah
    {
      t: "Galeri variasi",
      c: "Bingkai: satu spesies, empat habitat berbeda.",
    },
    {
      t: "Makalah",
      c: "Sorot bobot analisis dan lebar cakupan.",
    },
    {
      t: "Artikel Jurnal",
      c: "Tekankan peer review sebagai gerbang mutu.",
    },
    {
      t: "Skripsi",
      c: "Karya sarjana — metodologi jadi panggung utama.",
    },
    {
      t: "Proposal PKM",
      c: "Ketuk aspek kebaruan dan kelayakan anggaran.",
    },
    {
      t: "Mode komparasi [B]",
      c: "Bandingkan sekaligus; tutup: 'pilih sesuai medannya.'",
    },
  ],
  [
    // 07 KAIDAH & ETIKA — 3 langkah
    {
      t: "EYD Edisi V",
      c: "Contoh cepat perubahan ejaan 2022 — jangan baca semua butir.",
    },
    {
      t: "Kalimat Efektif",
      c: "Bacakan sebelum/sesudah dengan intonasi berbeda.",
    },
    {
      t: "Anti-Plagiarisme",
      c: "Nada serius: gagasan dipinjam wajib dipulangkan.",
    },
  ],
  [
    // 08 PENUTUP — 6 langkah
    {
      t: "Simpulan 1 — Struktur",
      c: "Pelankan tempo; ruangan mulai berkesan.",
    },
    {
      t: "Simpulan 2 — Alur argumen",
      c: "Tangan kanan menelusuri kiri→kanan; gestur sederhana.",
    },
    {
      t: "Simpulan 3 — Adaptasi",
      c: "Kaitkan balik ke kartu Variasi KTI.",
    },
    {
      t: "Simpulan 4 — Bahasa",
      c: "Presisi bahasa = presisi berpikir; jeda setelah kalimat ini.",
    },
    {
      t: "Callback kalimat pembuka",
      c: "'Kita SUDAH bedah anatominya' — beri tekanan pada SUDAH.",
    },
    {
      t: "Terima kasih & tanya jawab",
      c: "Buka lantai; statistik sesi tampil sebagai penutup meyakinkan.",
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
