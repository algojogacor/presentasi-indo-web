// Kontrak polling bersama — dipakai oleh: presentasi (presenter screen),
// halaman voting audiens (#/voting), dan validasi API backend.
// JANGAN mengubah bentuk kontrak tanpa menyinkronkan semua konsumen.

export type OptionKey = "A" | "B" | "C" | "D";

export interface PollOption {
  key: OptionKey;
  label: string;
  correct?: boolean;
}

export interface PollQuestion {
  id: number;
  prompt: string;
  options: PollOption[];
  answerNote: string;
}

export const QUESTIONS: PollQuestion[] = [
  {
    id: 1,
    prompt:
      "Di kalangan mahasiswa sering beredar anggapan: 'Karya ilmiah yang bagus itu yang halamannya tebal berjilid-jilid.' Benarkah anggapan ini ketika karya kalian diikutsertakan dalam kompetisi Proposal PKM atau publikasi Jurnal Ilmiah?",
    options: [
      { key: "A", label: "Benar, semakin tebal jumlah halamannya, reviewer menganggap risetnya semakin berbobot" },
      {
        key: "B",
        label: "Salah, setiap KTI punya batas ketat—di PKM bahkan kelebihan 1 halaman langsung gugur!",
        correct: true,
      },
      { key: "C", label: "Benar, asalkan 70% isinya dipenuhi bab kajian teori dari buku-buku tebal" },
      { key: "D", label: "Format ketebalan halaman bebas dan tidak pernah menjadi kriteria penilaian" },
    ],
    answerNote:
      "Berdasarkan pedoman Ditbelmawa Dikti (2023) dan Tabel 2 makalah, karya ilmiah tidak dinilai dari ketebalannya. Proposal PKM memiliki batas maksimal mutlak 10 halaman isi inti dan langsung gugur jika melebihi batas. Artikel jurnal pun menuntut format IMRaD yang ringkas dan padat kebaruan (novelty), bukan ketebalan halaman.",
  },
  {
    id: 2,
    prompt:
      "Bayangkan struktur anatomi KTI kalian sudah lengkap dari Bab I sampai V. Namun, kesalahan fatal apa yang paling sering membuat karya ilmiah mahasiswa langsung DITOLAK atau dicoret dosen penguji?",
    options: [
      { key: "A", label: "Jumlah halaman kurang tebal dibanding kelompok mahasiswa lain" },
      { key: "B", label: "Tidak mencantumkan lampiran dokumentasi foto kegiatan" },
      {
        key: "C",
        label: "Kalimat bertele-tele melanggar EYD serta sitasi yang tidak jujur (indikasi plagiarisme)",
        correct: true,
      },
      { key: "D", label: "Menggunakan diagram batang alih-alih menyajikan tabel angka mentah" },
    ],
    answerNote:
      "Berdasarkan Kepmendikbudristek No. 0424/P/2022 (EYD V) dan etika penulisan ilmiah, struktur anatomi yang lengkap akan runtuh jika bahasa yang digunakan rancu, bertele-tele, melanggar kaidah baku, atau terindikasi plagiarisme akibat sitasi dan parafrase yang manipulatif. Inilah jembatan menuju Babak 7.",
  },
];

export function getQuestion(id: number): PollQuestion | undefined {
  return QUESTIONS.find((q) => q.id === id);
}

export function isOptionValid(questionId: number, option: string): boolean {
  const q = getQuestion(questionId);
  return !!q && q.options.some((o) => o.key === option);
}

export interface ResultsPayload {
  question: number;
  total: number;
  options: { key: string; label: string; count: number }[];
}
