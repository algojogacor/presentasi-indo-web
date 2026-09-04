import { REFERENCES } from "@/data/bibliography";

export default function BabThree() {
  return (
    <div className="space-y-12">
      {/* BAB III Penutup */}
      <section id="bab3" className="scroll-mt-20 border-b border-white/10 pb-10">
        <div className="mb-6 inline-block rounded border border-[#E8A020]/30 bg-[#E8A020]/5 px-2.5 py-0.5 font-code text-[10px] uppercase tracking-widest text-[#E8A020]">
          BAB III · PENUTUP
        </div>

        <h2 className="font-display text-[26px] md:text-[30px] font-bold text-[#F0EDE8] mb-6">
          BAB III — Penutup
        </h2>

        {/* 3.1 Simpulan */}
        <div className="space-y-4 mb-8">
          <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
            3.1 Simpulan
          </h3>
          <p className="font-body text-[14px] text-paper/85">
            Berdasarkan pembahasan pada bab-bab sebelumnya, dapat ditarik simpulan sebagai berikut:
          </p>
          <ol className="list-decimal pl-6 space-y-3 font-body text-[14px] md:text-[15px] text-paper/90 text-justify">
            <li>
              Karya ilmiah merupakan uraian atau penjabaran hasil temuan berdasarkan data primer dan data sekunder yang bertujuan untuk memecahkan masalah tertentu dengan metode ilmiah yang dapat dipertanggungjawabkan.
            </li>
            <li>
              Struktur anatomi umum karya ilmiah terbagi menjadi tiga bagian utama, yaitu bagian awal (<em>preliminaries</em> meliputi judul, pengesahan, kata pengantar, abstrak, daftar isi), bagian inti (<em>body text</em> yang terdiri atas pendahuluan, kajian pustaka, metode penelitian, hasil dan pembahasan, serta penutup), dan bagian akhir (<em>postliminaries</em> mencakup daftar pustaka dan lampiran).
            </li>
            <li>
              Penerapan struktur karya ilmiah memiliki fleksibilitas sesuai wadah publikasinya, mulai dari struktur sederhana pada makalah kuliah, struktur IMRaD pada artikel jurnal, hingga struktur terpaut pada proposal Program Kreativitas Mahasiswa.
            </li>
            <li>
              Keberhasilan penyusunan karya ilmiah berpijak pada keharmonisan logika antar bab, penerapan kaidah kebahasaan baku berdasarkan aturan EYD Edisi V, pembentukan kalimat efektif, serta kepatuhan mutlak terhadap etika sitasi bebas plagiarisme.
            </li>
          </ol>
        </div>

        {/* 3.2 Saran */}
        <div className="space-y-4">
          <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
            3.2 Saran
          </h3>
          <p className="font-body text-[14px] text-paper/85">
            Adapun saran yang dapat diajukan sehubungan dengan penulisan karya ilmiah adalah:
          </p>
          <ol className="list-decimal pl-6 space-y-3 font-body text-[14px] md:text-[15px] text-paper/90 text-justify">
            <li>
              Mahasiswa sebaiknya memahami dengan baik cara menyusun struktur karya ilmiah, terutama bagaimana masalah yang dinyatakan di bagian pendahuluan harus sejalan dengan analisis yang dilakukan di bagian pembahasan serta kesimpulan yang ditarik.
            </li>
            <li>
              Pembelajaran Mata Kuliah Wajib Umum (MKWU) Bahasa Indonesia di perguruan tinggi diharapkan memberikan lebih banyak latihan praktis dalam menulis artikel jurnal dan proposal penelitian yang sesuai dengan acuan baku.
            </li>
          </ol>
        </div>
      </section>

      {/* Daftar Pustaka */}
      <section id="pustaka" className="scroll-mt-20 pb-12">
        <div className="mb-6 inline-block rounded border border-[#E8A020]/30 bg-[#E8A020]/5 px-2.5 py-0.5 font-code text-[10px] uppercase tracking-widest text-[#E8A020]">
          POSTLIMINARIES · DAFTAR PUSTAKA
        </div>

        <h2 className="font-display text-[26px] md:text-[30px] font-bold text-[#F0EDE8] mb-6">
          Daftar Pustaka
        </h2>

        <div className="space-y-4 font-body text-[13px] md:text-[14px] leading-relaxed text-paper/85">
          {REFERENCES.map((ref) => (
            <div
              key={ref.id}
              className="rounded border border-white/10 bg-[#0A0A0F]/60 p-4 transition-all hover:border-[#E8A020]/40"
            >
              <p className="pl-3 border-l-2 border-[#E8A020]/60">
                <span className="font-semibold text-paper">{ref.authors}</span>{" "}
                <span>({ref.year}).</span>{" "}
                <span className="font-display italic text-[#F0EDE8]">
                  {ref.title}.
                </span>{" "}
                <span className="text-mute">{ref.source}</span>
              </p>
              {(ref.doi || ref.url) && (
                <div className="mt-2 pl-3">
                  <a
                    href={ref.doi || ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-code text-[11px] text-[#E8A020] hover:text-[#FFB740] hover:underline flex items-center gap-1"
                  >
                    <span>↗</span>
                    <span className="truncate">{ref.doi ?? ref.url}</span>
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
