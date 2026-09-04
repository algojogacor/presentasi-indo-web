// Data untuk Section 2 — Latar Belakang, Rumusan Masalah, Tujuan & Manfaat
// Berdasarkan Bab I Makalah Kelompok 6 PDB 93

export const STATEMENT =
  "Struktur dalam penulisan karya ilmiah berfungsi sebagai kerangka logis yang mengarahkan pembaca untuk memahami alur pemikiran penulis dari perumusan fenomena hingga penarikan kesimpulan.";

export const FACTS = [
  {
    tag: "FAKTA 01 — KOMUNIKASI AKADEMIK",
    text: "Karya ilmiah bukan sekadar sarana melaporkan riset, melainkan alat krusial pengembang pemikiran kritis dan analitis di tengah pesatnya tuntutan publikasi bereputasi (Musdalifah et al., 2025).",
  },
  {
    tag: "FAKTA 02 — HAMBATAN MAHASISWA",
    text: "Banyak mahasiswa masih terhambat menyusun karya ilmiah standar akibat minimnya penguasaan struktur anatomi dan kurangnya latihan penulisan terarah (Baharuddin et al., 2025).",
  },
  {
    tag: "FAKTA 03 — KERANGKA LOGIS",
    text: "Setiap bab KTI memiliki fungsi distingtif; memahami struktur anatomi bukan sebatas kepatuhan teknis, melainkan esensial dalam membangun argumen ilmiah yang utuh dan sahih.",
  },
];

export interface DocketItem {
  roman: string;
  sub: string;
  title: string;
  question: string;
  mandat: string;
  roadmap: string;
}

export const DOCKET_ITEMS: DocketItem[] = [
  {
    roman: "I",
    sub: "SUB-BAB 1.2.1",
    title: "HAKIKAT & KARAKTERISTIK",
    question:
      "Apa hakikat, fungsi, dan karakteristik dasar dari karya tulis ilmiah?",
    mandat:
      "Menjelaskan hakikat KTI dan 5 karakteristik distingtif: objektif, logis, sistematis, cendekia, dan verifikatif.",
    roadmap: "DIJAWAB PADA // ACT.03: HAKIKAT & KARAKTERISTIK",
  },
  {
    roman: "II",
    sub: "SUB-BAB 1.2.2",
    title: "STRUKTUR ANATOMI UMUM",
    question:
      "Bagaimana struktur anatomi umum dalam karya tulis ilmiah dari bagian awal, inti, hingga akhir?",
    mandat:
      "Menguraikan secara komprehensif anatomi baku Preliminaries, Body Text (BAB I–V), dan Postliminaries.",
    roadmap: "DIJAWAB PADA // ACT.04: ANATOMY THEATER",
  },
  {
    roman: "III",
    sub: "SUB-BAB 1.2.3",
    title: "VARIASI SISTEMATIKA GENRE",
    question:
      "Bagaimana variasi sistematika pada berbagai jenis karya ilmiah, seperti makalah, artikel jurnal, skripsi, dan proposal/laporan PKM?",
    mandat:
      "Menganalisis variasi struktur format IMRaD vs Bab Romawi serta orientasi novelty pada tiap genre akademik.",
    roadmap: "DIJAWAB PADA // ACT.06: VARIASI KTI & BATTLE CARDS",
  },
  {
    roman: "IV",
    sub: "SUB-BAB 1.2.4",
    title: "KAIDAH KEBAHASAAN & ETIKA",
    question:
      "Bagaimana peran kaidah kebahasaan dan etika akademik dalam mendukung keutuhan struktur karya ilmiah?",
    mandat:
      "Menjelaskan pentingnya penerapan ragam bahasa baku dan etika perujukan ilmiah guna mencegah plagiarisme.",
    roadmap: "DIJAWAB PADA // ACT.07: KAIDAH & ETIKA",
  },
];

export const MANFAAT_DATA = {
  label: "SUB-BAB 1.4 · MANFAAT PENULISAN",
  teoritis: {
    title: "MANFAAT TEORETIS",
    desc: "Acuan komparatif dalam mempelajari bahasa teks akademik & kajian keilmuan struktur penulisan ilmiah di perguruan tinggi (baku KBBI).",
  },
  praktis: {
    title: "MANFAAT PRAKTIS",
    desc: "Panduan terstruktur bagi mahasiswa dalam merancang, menulis, dan memublikasikan berbagai ragam karya ilmiah standar.",
  },
};
