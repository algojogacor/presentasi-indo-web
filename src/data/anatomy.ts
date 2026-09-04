export const ROMAN = ["I", "II", "III", "IV", "V"];

export const PRELIM_ITEMS: [string, string, string][] = [
  ["01", "Halaman Judul", "Judul, tujuan penulisan, logo institusi, identitas penyusun, instansi, dan tahun"],
  ["02", "Halaman Pengesahan", "Tanda tangan pembimbing dan penguji sebagai bukti legalitas serta validitas"],
  ["03", "Abstrak & Kata Kunci", "Inti ringkas: latar belakang, tujuan, metode, hasil temuan, simpulan, serta 3–5 kata kunci"],
  ["04", "Kata Pengantar", "Ucapan syukur, maksud penulisan, apresiasi pihak pembantu, dan keterbukaan kritik/saran"],
  ["05", "Daftar Isi & Visual", "Navigasi halaman untuk bab, subbab, tabel, gambar, serta lampiran guna mempermudah pembaca"],
];

export interface ChapterData {
  k: string;
  title: string;
  one: string;
  detail: string;
}

export const CHAPTERS: ChapterData[] = [
  {
    k: "A",
    title: "BAB I — Pendahuluan",
    one: "Pola piramida terbalik & formulasi masalah.",
    detail:
      "1. Latar Belakang Masalah (pola piramida terbalik: isu umum, urgensi, gap penelitian, justifikasi topik); 2. Identifikasi & Pembatasan Masalah (penegasan fokus); 3. Rumusan Masalah (spesifik 5W1H); 4. Tujuan Penelitian (korespondensi 1:1); 5. Manfaat Penelitian (teoretis & praktis).",
  },
  {
    k: "B",
    title: "BAB II — Kajian Pustaka",
    one: "Landasan teoretis, novelty, & kerangka pikir.",
    detail:
      "1. Kajian Teori (konsep dan model mutakhir sebagai basis analisis); 2. Tinjauan Penelitian Terdahulu (pemetaan posisi & kebaruan/novelty); 3. Kerangka Berpikir (bagan alur penalaran hubungan variabel); 4. Hipotesis Penelitian (dugaan sementara uji statistik).",
  },
  {
    k: "C",
    title: "BAB III — Metodologi Penelitian",
    one: "Prosedur transparan untuk replikasi ilmiah.",
    detail:
      "1. Pendekatan & Jenis (kuantitatif, kualitatif, mixed methods, tindakan); 2. Tempat & Waktu; 3. Populasi, Sampel / Sumber Data & Teknik Sampling; 4. Teknik Pengumpulan Data; 5. Instrumen & Uji Validitas/Reliabilitas; 6. Teknik Analisis Data.",
  },
  {
    k: "D",
    title: "BAB IV — Hasil dan Pembahasan",
    one: "Penyajian data objektif & dialektika kritis.",
    detail:
      "1. Deskripsi Hasil (penyajian naratif, tabel, atau grafik data objektif temuan); 2. Pembahasan (bagian paling kritis: menafsirkan temuan, mengaitkannya dengan teori Bab II, membandingkan riset terdahulu, menjelaskan sebab hasil, serta limitasi penelitian).",
  },
  {
    k: "E",
    title: "BAB V — Penutup",
    one: "Jawaban rumusan masalah & rekomendasi.",
    detail:
      "1. Simpulan (ringkasan substantif yang menjawab rumusan masalah secara lugas berdasarkan pembahasan, bukan mengulang angka data mentah); 2. Saran (rekomendasi operasional bagi pihak terkait dan arah penelitian lanjutan/future research).",
  },
];

export const POST_ITEMS: [string, string, string][] = [
  ["01", "Daftar Pustaka", "Seluruh rujukan in-text disusun alfabetis sesuai gaya baku (APA, Harvard, IEEE)"],
  ["02", "Lampiran (Appendices)", "Dokumen pelengkap detail: instrumen kuesioner, transkrip wawancara, perhitungan statistik mentah, surat izin"],
  ["03", "Riwayat Hidup (CV)", "Profil singkat rekam jejak akademis penulis (opsional pada skripsi atau laporan)"],
];

export const ZONE_META: Record<number, { label: string; hex: string; rgba: (a: number) => string }> = {
  1: {
    label: "PRELIMINARIES",
    hex: "#E8A020",
    rgba: (a) => `rgba(232,160,32,${a})`,
  },
  2: {
    label: "BODY TEXT",
    hex: "#F0EDE8",
    rgba: (a) => `rgba(240,237,232,${a})`,
  },
  3: {
    label: "POSTLIMINARIES",
    hex: "#FFB740",
    rgba: (a) => `rgba(255,183,64,${a})`,
  },
};
