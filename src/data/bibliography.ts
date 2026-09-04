// Data 13 Daftar Pustaka resmi dari Bab III Makalah Kelompok 6 PDB 93 (APA Style 7th Edition)

export type ReferenceType =
  | "JURNAL"
  | "BUKU TEKS"
  | "PEDOMAN RESMI"
  | "LEKSIKOGRAFI";

export interface ReferenceItem {
  id: number;
  authors: string;
  year: string;
  title: string;
  source: string;
  url?: string;
  doi?: string;
  type: ReferenceType;
  /** Babak presentasi (act index) yang mengutip referensi ini */
  acts: number[];
}

export const REFERENCES: ReferenceItem[] = [
  {
    id: 1,
    authors: "Badan Pengembangan dan Pembinaan Bahasa.",
    year: "2022",
    title: "Pedoman umum ejaan bahasa Indonesia (EYD Edisi V)",
    source:
      "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.",
    url: "https://ejaan.kemendikdasmen.go.id/eyd/",
    type: "PEDOMAN RESMI",
    acts: [7, 8],
  },
  {
    id: 2,
    authors: "Badan Pengembangan dan Pembinaan Bahasa.",
    year: "2024",
    title: "Kamus besar bahasa Indonesia (KBBI daring)",
    source:
      "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi Republik Indonesia.",
    url: "https://kbbi.kemendikdasmen.go.id/",
    type: "LEKSIKOGRAFI",
    acts: [3],
  },
  {
    id: 3,
    authors:
      "Baharuddin, B., Muthi, I., Haryono, P., Misbahul Alam, D., Sugiarti, D. Y., Muntaha, M., Apriliantoni, A., Annuri, A., Darwis, D., Eriyatuzzahro, D., Khumaidi, A., Paradiyawan, P., Sumodiharjo, B., Dindin, D., & Ulfa, M.",
    year: "2025",
    title:
      "Pengembangan kompetensi profesional guru melalui strategi penulisan karya ilmiah",
    source:
      "Jurnal Pengabdian Masyarakat dan Riset Pendidikan, 4(1), 1–15.",
    doi: "https://doi.org/10.31004/jerkin.v4i1.1813",
    type: "JURNAL",
    acts: [2],
  },
  {
    id: 4,
    authors: "Direktorat Pembelajaran dan Kemahasiswaan.",
    year: "2023",
    title: "Buku pedoman Program Kreativitas Mahasiswa (PKM) tahun 2023",
    source: "Ditjen Diktiristek, Kemendikbudristek RI.",
    url: "https://simbelmawa.kemdiktisaintek.go.id/portal/pedoman-pkm-tahun-2023-diktiridtek/",
    type: "PEDOMAN RESMI",
    acts: [4, 6],
  },
  {
    id: 5,
    authors: "Farida, Y. E.",
    year: "2024",
    title: "Buku ajar bahasa Indonesia perguruan tinggi",
    source: "Penerbit Deepublish.",
    url: "https://deepublishstore.com/produk/buku-ajar-bahasa-indonesia-perguruan-tinggi/",
    type: "BUKU TEKS",
    acts: [3, 4, 6, 7],
  },
  {
    id: 6,
    authors: "Fitriani, L., Gultom, R. H., & Nainggolan, N. P.",
    year: "2023",
    title:
      "Struktur dan pengaruh teks akademik dan non-akademik dalam meningkatkan pemahaman mahasiswa",
    source:
      "Jurnal Bima: Pusat Publikasi Ilmu Pendidikan Bahasa dan Sastra, 1(4), 307–326.",
    url: "https://journal.aripi.or.id/index.php/Bima/article/view/307",
    type: "JURNAL",
    acts: [4, 5, 6],
  },
  {
    id: 7,
    authors: "Jumadi, A., Saputra, Z. E., & Sari, G.",
    year: "2024",
    title:
      "Analisis kesalahan berbahasa Indonesia pada karya tulis ilmiah mahasiswa",
    source:
      "Jurnal Idebahasa: Jurnal Pendidikan Bahasa dan Sastra Indonesia, 6(2), 112–125.",
    url: "https://jurnal.idebahasa.or.id/index.php/Idebahasa/article/view/196",
    type: "JURNAL",
    acts: [7],
  },
  {
    id: 8,
    authors: "Musdalifah, M., Karim, A., & Saud, C. F.",
    year: "2025",
    title:
      "Membangun literasi akademik melalui pelatihan penulisan karya ilmiah untuk mahasiswa baru",
    source: "Inovasi Sosial: Jurnal Pengabdian Masyarakat, 2(4), 1–10.",
    doi: "https://doi.org/10.62951/inovasisosial.v2i4.2249",
    type: "JURNAL",
    acts: [2],
  },
  {
    id: 9,
    authors: "Nugraha, M. S., Rohmadi, M., & Nugraheni, A. S.",
    year: "2022",
    title:
      "Bahasa Indonesia untuk perguruan tinggi: Teori dan penerapan penulisan ilmiah",
    source: "Cakrawala Media.",
    url: "https://bintangpusnas.perpusnas.go.id/konten/BK47058/bahasa-indonesia-untuk-perguruan-tinggi",
    type: "BUKU TEKS",
    acts: [4],
  },
  {
    id: 10,
    authors: "Samal, A. L., & Ardianto, A.",
    year: "2025",
    title: "Bahasa Indonesia dan karya tulis ilmiah untuk perguruan tinggi",
    source: "IAIN Manado Press.",
    url: "https://repository.iain-manado.ac.id/2188/",
    type: "BUKU TEKS",
    acts: [3],
  },
  {
    id: 11,
    authors: "Sugiyono.",
    year: "2022",
    title: "Metode penelitian kuantitatif, kualitatif, dan R&D (Edisi terbaru)",
    source: "Alfabeta.",
    url: "https://cvalfabeta.com/product/metode-penelitian-kuantitatif-kualitatif-dan-rd-sugiyono/",
    type: "BUKU TEKS",
    acts: [4],
  },
  {
    id: 12,
    authors: "Widiyastuti, R., Wardani, K., & Hasanah, U.",
    year: "2023",
    title: "Panduan praktis penulisan karya tulis ilmiah",
    source: "Unwim Press.",
    url: "https://repo.unwim.ac.id/1239/",
    type: "BUKU TEKS",
    acts: [3, 4, 5],
  },
  {
    id: 13,
    authors:
      "Wulandari, A. A., Panudju, A. A. T., Hidayatullah, M. A., Maryani, M., Supriyati, W., Amalia, N., Dewi, L. P., Desderius, K., & Barus, F. A.",
    year: "2024",
    title: "Penulisan karya ilmiah (U. Y. Sundari, Ed.)",
    source: "CV. Gita Lentera.",
    url: "https://www.researchgate.net/publication/389853704_PENULISAN_KARYA_ILMIAH",
    type: "BUKU TEKS",
    acts: [3],
  },
];
