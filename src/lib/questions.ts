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
      "Menurut kajian sistematika KTI, apa perbedaan paling esensial antara artikel jurnal ilmiah dan makalah tugas perkuliahan?",
    options: [
      { key: "A", label: "Jumlah halaman fisik dan batas waktu pengumpulan tugas" },
      {
        key: "B",
        label: "Format struktur IMRaD tanpa bab Romawi serta orientasi mutlak pada novelty",
        correct: true,
      },
      { key: "C", label: "Penggunaan kosakata teknis dan bahasa asing yang jauh lebih dominan" },
      { key: "D", label: "Topik bahasan yang diangkat oleh penulis di ruang kelas" },
    ],
    answerNote:
      "Berdasarkan Tabel 2 (Fitriani et al., 2023), artikel jurnal memadatkan struktur menjadi format IMRaD (Introduction, Methods, Results, Discussion) tanpa bab berangka Romawi dan sangat memprioritaskan keterbaruan (novelty) untuk publikasi bereputasi, berbeda dengan makalah kuliah yang menggunakan format 3 bab ringkas untuk kajian konseptual tugas.",
  },
  {
    id: 2,
    prompt:
      "Di manakah letak pembuktian kontribusi ilmiah dan orisinalitas utama seorang peneliti dalam struktur karya ilmiah?",
    options: [
      { key: "A", label: "Kelengkapan sajian data mentah dan grafik pada deskripsi hasil (Bab IV)" },
      {
        key: "B",
        label: "Dialektika tafsir temuan dengan teori dan riset terdahulu di pembahasan (Bab IV)",
        correct: true,
      },
      { key: "C", label: "Banyaknya kutipan teori mutakhir yang dihimpun di tinjauan pustaka (Bab II)" },
      { key: "D", label: "Keluasan ruang lingkup saran dan rekomendasi kebijakan di penutup (Bab V)" },
    ],
    answerNote:
      "Sesuai sub-bab 2.2.2, Pembahasan (Discussion) adalah bagian paling kritis dalam karya ilmiah. Kontribusi ilmiah bukan sekadar memaparkan angka data mentah, melainkan kemampuan penulis menafsirkan temuan, mengonfrontasikannya dengan teori Bab II, membandingkannya dengan riset terdahulu, serta menjelaskan penyebab temuan tersebut (Widiyastuti et al., 2023).",
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
