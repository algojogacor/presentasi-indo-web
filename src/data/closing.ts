export const SIMPULAN: string[] = [
  "Karya ilmiah merupakan uraian atau penjabaran hasil temuan berdasarkan data primer dan data sekunder yang bertujuan untuk memecahkan masalah tertentu dengan metode ilmiah yang dapat dipertanggungjawabkan.",
  "Struktur anatomi umum karya ilmiah terbagi menjadi tiga bagian utama, yaitu bagian awal (preliminaries meliputi judul, pengesahan, kata pengantar, abstrak, daftar isi), bagian inti (body text yang terdiri atas pendahuluan, kajian pustaka, metode penelitian, hasil dan pembahasan, serta penutup), dan bagian akhir (postliminaries mencakup daftar pustaka dan lampiran).",
  "Penerapan struktur karya ilmiah memiliki fleksibilitas sesuai wadah publikasinya, mulai dari struktur sederhana pada makalah kuliah, struktur IMRaD pada artikel jurnal, hingga struktur terpaut pada proposal Program Kreativitas Mahasiswa.",
  "Keberhasilan penyusunan karya ilmiah berpijak pada keharmonisan logika antar bab, penerapan kaidah kebahasaan baku berdasarkan aturan EYD Edisi V, pembentukan kalimat efektif, serta kepatuhan mutlak terhadap etika sitasi bebas plagiarisme.",
];

export interface SimpulanMeta {
  num: string;
  tag: string;
  sub: string;
}

export const SIMPULAN_METAS: SimpulanMeta[] = [
  {
    num: "01",
    tag: "HAKIKAT & METODE",
    sub: "Data Primer & Sekunder · Pemecahan Masalah Teruji",
  },
  {
    num: "02",
    tag: "TIGA RONGGA ANATOMI",
    sub: "Preliminaries · Body Text (5 Bab) · Postliminaries",
  },
  {
    num: "03",
    tag: "FLEKSIBILITAS WADAH",
    sub: "Makalah Kuliah · Format IMRaD · Proposal PKM",
  },
  {
    num: "04",
    tag: "KAIDAH & INTEGRITAS",
    sub: "Logika Antarbab · Kaidah EYD V · Bebas Plagiarisme",
  },
];

export interface AmbientWord {
  t: string;
  x: string;
  y: string;
  s: string;
  d: string;
  r?: string;
}

export const AMBIENT_WORDS: AmbientWord[] = [
  { t: "preliminaries", x: "5%", y: "16%", s: "3.2vw", d: "16s", r: "-5deg" },
  { t: "IMRAD", x: "78%", y: "11%", s: "5vw", d: "13s", r: "4deg" },
  { t: "verifikatif", x: "66%", y: "72%", s: "2.6vw", d: "18s" },
  { t: "abstrak", x: "10%", y: "78%", s: "4vw", d: "14s" },
  { t: "objektif", x: "40%", y: "7%", s: "2.2vw", d: "17s" },
  { t: "tinjauan pustaka", x: "26%", y: "88%", s: "2.4vw", d: "20s" },
  { t: "daftar pustaka", x: "80%", y: "42%", s: "2vw", d: "15s" },
  { t: "sistematis", x: "46%", y: "56%", s: "6vw", d: "22s", r: "3deg" },
];
