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
      "Kalian sering membuat makalah tugas kuliah. Jika makalah tersebut ingin diterbitkan menjadi artikel jurnal ilmiah bereputasi, perubahan apa yang paling mendasar?",
    options: [
      { key: "A", label: "Mempertebal tinjauan pustaka dan menambah jumlah bab" },
      { key: "B", label: "Mengganti istilah Indonesia ke bahasa asing agar terlihat lebih teknis" },
      {
        key: "C",
        label: "Mengubahnya ke format IMRaD (tanpa bab Romawi) dan berorientasi pada novelty",
        correct: true,
      },
      { key: "D", label: "Menghapus pendahuluan dan langsung menyajikan data mentah" },
    ],
    answerNote:
      "Berdasarkan Tabel 2 makalah (Fitriani et al., 2023), artikel jurnal memadatkan struktur menjadi format IMRaD (Introduction, Methods, Results, Discussion) tanpa bab berangka Romawi dan sangat memprioritaskan keterbaruan (novelty) untuk publikasi bereputasi, berbeda dengan makalah kuliah yang menggunakan format 3 bab ringkas untuk kajian konseptual tugas.",
  },
  {
    id: 2,
    prompt:
      "Di antara jenis karya ilmiah berikut, mana yang memiliki aturan format administratif paling ketat dan langsung gugur jika melanggar batas halaman?",
    options: [
      { key: "A", label: "Skripsi / Tesis tugas akhir" },
      { key: "B", label: "Makalah kajian konseptual tugas kuliah" },
      { key: "C", label: "Artikel jurnal ilmiah nasional" },
      {
        key: "D",
        label: "Proposal PKM (Program Kreativitas Mahasiswa)",
        correct: true,
      },
    ],
    answerNote:
      "Berdasarkan pedoman Dikti (2023) dan Tabel 2 makalah, Proposal PKM memiliki seleksi administratif awal yang sangat ketat di Simbelmawa dengan batasan maksimal 10 halaman isi inti. Pelanggaran format atau batas halaman akan langsung menggugurkan proposal pada tahap seleksi administrasi sebelum sempat dinilai substansinya.",
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
