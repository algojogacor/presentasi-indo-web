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
    prompt: "Menurut kamu, apa perbedaan paling mendasar antara makalah dan artikel jurnal?",
    options: [
      { key: "A", label: "Jumlah halaman dan panjang tulisan" },
      { key: "B", label: "Struktur dan tujuan publikasinya", correct: true },
      { key: "C", label: "Bahasa dan jenis huruf yang digunakan" },
      { key: "D", label: "Tema atau topik yang diangkat" },
    ],
    answerNote:
      "Makalah bergerak relatif bebas mengikuti pedoman studi — artikel jurnal terikat struktur IMRAD yang ketat karena tujuannya dipublikasikan dan melewati peer review. Perbedaan mendasarnya ada pada kerangka tubuh dan habitatnya, bukan sekadar ukuran.",
  },
  {
    id: 2,
    prompt:
      "Karakteristik KTI yang menuntut penulis bebas dari kepentingan pribadi dan bertumpu pada fakta serta data adalah…",
    options: [
      { key: "A", label: "Logis" },
      { key: "B", label: "Objektif", correct: true },
      { key: "C", label: "Verifikatif" },
      { key: "D", label: "Cendekia" },
    ],
    answerNote:
      "Objektif = sikap netral yang bertumpu pada fakta dan data. Logis menjaga runtutnya penalaran, verifikatif menjaga bisa-diujinya kembali — sedangkan kemerdekaan dari kepentingan pribadi adalah wilayah objektif.",
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
