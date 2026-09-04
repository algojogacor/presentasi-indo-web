// Data Naskah Lengkap Makalah Kelompok 6 PDB 93 Universitas Airlangga

export interface Author {
  name: string;
  nim: string;
}

export const PAPER_META = {
  title:
    "SISTEMATIKA DAN STRUKTUR ANATOMI KARYA TULIS ILMIAH: KAJIAN TEORITIS DAN PRAKTIS DALAM PENULISAN AKADEMIK",
  lecturer: "Drs. Eddy Sugiri, M.Hum.",
  nip: "195508051985021001",
  group: "Kelompok 6 PDB 93",
  institution: "Program Pembelajaran Dasar Bersama (PDB) 93 · Universitas Airlangga",
  year: "2026",
  city: "Surabaya",
  date: "23 Agustus 2026",
  downloadUrl: "/documents/Makalah_Kelompok_6_PDB_93.docx",
};

export const AUTHORS: Author[] = [
  { name: "Akbar Arya Maulana", nim: "626107097035" },
  { name: "Arya Rizky Ardhi Pratama", nim: "626103051310" },
  { name: "Dinda Naura Firdausy", nim: "626115327032" },
  { name: "Izzatul Hayati", nim: "626113145087" },
  { name: "Muhammad Adyan Faqih Huddin", nim: "626103051312" },
  { name: "Salma Nur Khasanah", nim: "626107097032" },
];

export const FOREWORD_PARAGRAPHS = [
  "Puji dan syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa karena atas rahmat dan karunia-Nya, makalah yang berjudul \"Sistematika dan Struktur Anatomi Karya Tulis Ilmiah: Kajian Teoritis dan Praktis dalam Penulisan Akademik\" ini dapat diselesaikan dengan baik.",
  "Makalah ini disusun untuk memberikan pemahaman yang komprehensif mengenai hakikat, karakteristik, struktur baku, serta variasi sistematika dalam berbagai jenis karya tulis ilmiah di lingkungan perguruan tinggi. Penulisan karya ilmiah bukan sekadar pemenuhan tugas akademik, melainkan sarana utama dalam mengomunikasikan gagasan, hasil penelitian, dan pengembangan ilmu pengetahuan secara objektif, logis, dan terstruktur.",
  "Penulis mengucapkan terima kasih sebesar-besarnya kepada seluruh pihak yang telah terlibat dalam memberikan arahan, referensi, dan bimbingan dalam penyusunan makalah ini. Penulis menyadari bahwa makalah ini masih banyak memiliki ruang untuk penyempurnaan. Oleh karena itu, kritik dan saran yang membangun sangat diharapkan demi perbaikan di masa depan.",
];

export const TABLE_OF_CONTENTS = [
  { id: "pengantar", label: "Kata Pengantar" },
  { id: "bab1", label: "BAB I · Pendahuluan" },
  { id: "bab2", label: "BAB II · Pembahasan" },
  { id: "bab3", label: "BAB III · Penutup" },
  { id: "pustaka", label: "Daftar Pustaka" },
];
