import { BookOpen, Newspaper, GraduationCap, Rocket, type LucideIcon } from "lucide-react";

export interface BattleRow {
  k: string;
  v: string;
  hot?: boolean;
}

export interface BattleCardData {
  title: string;
  sub: string;
  icon: LucideIcon;
  rows: BattleRow[];
  note: string;
}

export const CARDS: BattleCardData[] = [
  {
    title: "Makalah",
    sub: "TERM PAPER · TUGAS KULIAH",
    icon: BookOpen,
    rows: [
      { k: "FORMAT STRUKTUR", v: "Bab I (Pendahuluan) → Bab II (Pembahasan) → Bab III (Penutup)" },
      { k: "PANJANG", v: "Ringkas (10–20 halaman)" },
      { k: "FOKUS", v: "Kajian konseptual atau isu spesifik dalam perkuliahan" },
      { k: "CIRI KUNCI", v: "Sistematika 3 bab sederhana, berbasis studi pustaka (Farida, 2024)" },
    ],
    note: "Ringkas 10–20 halaman untuk tugas kuliah dengan struktur Bab I–III.",
  },
  {
    title: "Artikel Jurnal",
    sub: "FORMAT IMRAD · PUBLIKASI",
    icon: Newspaper,
    rows: [
      { k: "FORMAT STRUKTUR", v: "Format IMRaD (Introduction, Methods, Results, and Discussion)", hot: true },
      { k: "PANJANG", v: "Solid (4.000–7.000 kata)" },
      { k: "FOKUS", v: "Sangat memprioritaskan keterbaruan (novelty)", hot: true },
      { k: "CIRI KUNCI", v: "Tanpa bab Romawi; seleksi ketat peer review (Fitriani et al., 2023)" },
    ],
    note: "Solid dan padat IMRaD — mengutamakan novelty untuk publikasi bereputasi.",
  },
  {
    title: "Skripsi / Tesis",
    sub: "LAPORAN PENELITIAN · KELULUSAN",
    icon: GraduationCap,
    rows: [
      { k: "FORMAT STRUKTUR", v: "Format 5 Bab Lengkap (Pendahuluan, Teori, Metode, Hasil, Penutup)" },
      { k: "PANJANG", v: "Menyeluruh & mendalam (puluhan hingga ratusan halaman)", hot: true },
      { k: "FOKUS", v: "Penyajian metodologi dan instrumen secara rinci" },
      { k: "CIRI KUNCI", v: "Karya mandiri dengan data empiris dan lampiran instrumen lengkap" },
    ],
    note: "Format 5 bab lengkap menyeluruh untuk pertanggungjawaban gelar akademik.",
  },
  {
    title: "Proposal PKM",
    sub: "KOMPETISI HIBAH KEMENDIKBUD",
    icon: Rocket,
    rows: [
      { k: "FORMAT STRUKTUR", v: "Pendahuluan → Tinjauan Pustaka → Metode Pelaksanaan → Biaya & Jadwal" },
      { k: "PANJANG", v: "Ketat batasan halaman (maksimal 10 halaman isi inti)", hot: true },
      { k: "FOKUS", v: "Format administratif pokok sesuai Pedoman PKM", hot: true },
      { k: "CIRI KUNCI", v: "Proposal aksi berorientasi luaran, patuh pada aturan Simbelmawa (Dikti, 2023)" },
    ],
    note: "Ketat maksimal 10 halaman isi inti — format administratif pokok Pedoman PKM.",
  },
];
