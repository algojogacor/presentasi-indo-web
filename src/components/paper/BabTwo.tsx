export default function BabTwo() {
  return (
    <section id="bab2" className="scroll-mt-20 border-b border-white/10 pb-10">
      <div className="mb-6 inline-block rounded border border-[#E8A020]/30 bg-[#E8A020]/5 px-2.5 py-0.5 font-code text-[10px] uppercase tracking-widest text-[#E8A020]">
        BAB II · PEMBAHASAN
      </div>

      <h2 className="font-display text-[26px] md:text-[30px] font-bold text-[#F0EDE8] mb-6">
        BAB II — Pembahasan
      </h2>

      {/* 2.1 Hakikat dan Karakteristik KTI */}
      <div className="space-y-4 mb-8">
        <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
          2.1 Hakikat dan Karakteristik Karya Tulis Ilmiah
        </h3>
        <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
          Karya ilmiah didefinisikan oleh Wulandari et al. (2024), sebagai uraian atau penjabaran hasil temuan berdasarkan data sekunder dan data primer yang bertujuan untuk memecahkan masalah tertentu. Adapun data primer yang didapat langsung oleh peneliti melalui wawancara, kuesioner, atau observasi, dan data sekunder yang diperoleh melalui literatur atau data yang sudah ada seperti jurnal, buku, arsip, atau dokumen.
        </p>
        <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
          Menurut KBBI Daring (Badan Bahasa, 2024), karya ilmiah merupakan karya tulis yang sengaja dibuat dengan mematuhi kaidah-kaidah keilmuan dan dilandasi oleh hasil pengamatan, peninjauan, atau penelitian dalam bidang tertentu. Senada dengan hal tersebut, Samal dan Ardianto (2025) menjelaskan bahwa karya ilmiah adalah produk komunikasi akademik tertulis yang menyajikan gagasan rasional atau hasil investigasi empiris dengan metode ilmiah yang dapat dipertanggungjawabkan secara terbuka.
        </p>
        <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
          Karya tulis ilmiah memiliki karakteristik distingtif yang membedakannya dari karya sastra atau teks populer non-ilmiah (Widiyastuti et al., 2023):
        </p>
        <ul className="list-disc pl-6 space-y-2 font-body text-[14px] md:text-[15px] text-paper/90">
          <li><strong>Objektif:</strong> Setiap pernyataan, analisis, dan simpulan didasarkan pada data faktual atau bukti empiris, bukan opini pribadi yang emosional.</li>
          <li><strong>Logis dan Rasional:</strong> Alur penalaran disusun secara runtut, koheren, dan dapat diterima akal sehat (induktif maupun deduktif).</li>
          <li><strong>Sistematis:</strong> Mengikuti pola organisasi penulisan yang terstruktur, baku, dan berkesinambungan antarbab atau antarseksi.</li>
          <li><strong>Cendekia dan Lugas:</strong> Menggunakan ragam bahasa baku, kalimat efektif, istilah teknis yang tepat, serta menghindari ambiguitas atau metafora berlebihan.</li>
          <li><strong>Dapat Diuji Kebenarannya (Verifikatif):</strong> Prosedur penelitian dan metodologi disajikan secara transparan sehingga memungkinkan peneliti lain melakukan replikasi.</li>
        </ul>
      </div>

      {/* 2.2 Struktur Anatomi Umum KTI */}
      <div className="space-y-4 mb-8">
        <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
          2.2 Struktur Anatomi Umum Karya Tulis Ilmiah
        </h3>
        <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
          Secara umum, anatomi karya tulis ilmiah terbagi menjadi tiga bagian utama, yaitu bagian awal (<em>preliminaries</em>), bagian inti (<em>body text</em>), dan bagian akhir (<em>postliminaries</em>) (Nugraha et al., 2022).
        </p>

        {/* Tabel 1 */}
        <div className="my-4 overflow-x-auto rounded border border-white/10 bg-[#0A0A0F]/80">
          <table className="w-full text-left font-body text-[13px]">
            <thead className="border-b border-white/10 bg-white/5 font-code text-[11px] text-[#E8A020]">
              <tr>
                <th className="p-3">BAGIAN AWAL (PRELIMINARIES)</th>
                <th className="p-3">BAGIAN INTI (BODY TEXT)</th>
                <th className="p-3">BAGIAN AKHIR (POSTLIMINARIES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-paper/80">
              <tr>
                <td className="p-3 align-top">
                  • Halaman Judul<br />
                  • Lembar Pengesahan<br />
                  • Kata Pengantar<br />
                  • Abstrak &amp; Kata Kunci<br />
                  • Daftar Isi, Tabel, Gambar
                </td>
                <td className="p-3 align-top">
                  • BAB I: Pendahuluan<br />
                  • BAB II: Kajian Pustaka/Teori<br />
                  • BAB III: Metodologi Penelitian<br />
                  • BAB IV: Hasil &amp; Pembahasan<br />
                  • BAB V: Simpulan &amp; Saran
                </td>
                <td className="p-3 align-top">
                  • Daftar Pustaka<br />
                  • Lampiran<br />
                  • Biodata / Riwayat Hidup
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="font-body font-bold text-paper text-[15px]">2.2.1 Bagian Awal (Preliminaries)</h4>
          <p className="font-body text-[14px] leading-relaxed text-paper/85">
            Komponen pada bagian awal meliputi: 1. Halaman Judul (Title Page); 2. Halaman Pengesahan; 3. Abstrak dan Kata Kunci (3–5 kata kunci); 4. Kata Pengantar; 5. Daftar Isi, Daftar Tabel, Gambar, dan Lampiran.
          </p>
          <h4 className="font-body font-bold text-paper text-[15px]">2.2.2 Bagian Utama / Inti (Body Text)</h4>
          <p className="font-body text-[14px] leading-relaxed text-paper/85">
            Umumnya diorganisasikan dalam lima bab standar (Sugiyono, 2022; Samal &amp; Ardianto, 2025): BAB I Pendahuluan (piramida terbalik, pembatasan masalah, rumusan 5W1H, tujuan 1:1, manfaat teoretis &amp; praktis); BAB II Kajian Pustaka / Landasan Teoretis (kajian teori, penelitian terdahulu/novelty, kerangka berpikir, hipotesis); BAB III Metodologi Penelitian (pendekatan, tempat &amp; waktu, populasi &amp; sampel, instrumen validitas, teknik analisis); BAB IV Hasil dan Pembahasan (deskripsi hasil temuan dan pembahasan kritis dialektika teori); BAB V Penutup (simpulan substantif lugas dan saran rekomendasi operasional).
          </p>
          <h4 className="font-body font-bold text-paper text-[15px]">2.2.3 Bagian Akhir (Postliminaries)</h4>
          <p className="font-body text-[14px] leading-relaxed text-paper/85">
            Memuat: 1. Daftar Pustaka (alfabetis, APA/Harvard/IEEE); 2. Lampiran (kuesioner, transkrip, surat izin); 3. Riwayat Hidup (Curriculum Vitae).
          </p>
        </div>
      </div>

      {/* 2.3 Variasi Struktur Berdasarkan Jenis Karya Ilmiah */}
      <div className="space-y-4 mb-8">
        <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
          2.3 Variasi Struktur Berdasarkan Jenis Karya Ilmiah
        </h3>
        <p className="font-body text-[14px] md:text-[15px] leading-relaxed text-paper/85 text-justify">
          Struktur karya ilmiah disesuaikan dengan format penerbitan atau tujuan akademiknya (Direktorat Pembelajaran dan Kemahasiswaan, 2023; Fitriani et al., 2023):
        </p>
        <div className="my-4 overflow-x-auto rounded border border-white/10 bg-[#0A0A0F]/80">
          <table className="w-full text-left font-body text-[13px]">
            <thead className="border-b border-white/10 bg-white/5 font-code text-[11px] text-[#E8A020]">
              <tr>
                <th className="p-3">Jenis Karya Ilmiah</th>
                <th className="p-3">Format Struktur Utama</th>
                <th className="p-3">Karakteristik Kunci</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-paper/80">
              <tr>
                <td className="p-3 font-semibold text-paper">Makalah (Term Paper)</td>
                <td className="p-3">Bab I (Pendahuluan) → Bab II (Pembahasan) → Bab III (Penutup)</td>
                <td className="p-3">Ringkas (10–20 halaman), fokus pada kajian konseptual atau isu spesifik dalam perkuliahan (Samal &amp; Ardianto, 2025).</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-paper">Artikel Jurnal Ilmiah</td>
                <td className="p-3">Format IMRaD (Introduction, Methods, Results, and Discussion)</td>
                <td className="p-3">Solid (4.000–7.000 kata), tanpa bab Romawi, sangat memprioritaskan keterbaruan (novelty) (Fitriani et al., 2023).</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-paper">Skripsi / Tesis / Laporan</td>
                <td className="p-3">Format 5 Bab Lengkap (Pendahuluan, Teori, Metode, Hasil &amp; Pembahasan, Penutup)</td>
                <td className="p-3">Menyeluruh, mendalam, menyajikan metodologi dan instrumen secara rinci.</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-paper">Proposal PKM (Dikti)</td>
                <td className="p-3">Pendahuluan → Tinjauan Pustaka → Metode Pelaksanaan → Biaya &amp; Jadwal</td>
                <td className="p-3">Ketat dalam batasan halaman (maksimal 10 halaman isi inti), format administratif pokok sesuai Pedoman PKM.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 2.4 Kaidah Kebahasaan dan Etika Penulisan */}
      <div className="space-y-4">
        <h3 className="font-display text-[20px] font-semibold text-[#E8A020]">
          2.4 Kaidah Kebahasaan dan Etika Penulisan dalam Struktur Ilmiah
        </h3>
        <ol className="list-decimal pl-6 space-y-3 font-body text-[14px] md:text-[15px] text-paper/85 text-justify">
          <li>
            <strong>Penerapan Ejaan dan Tata Tulis Resmi:</strong> Mengacu pada ketetapan Pedoman Umum Ejaan Bahasa Indonesia (EYD Edisi V) melalui Kepmendikbudristek No. 0424/P/2022 (Badan Bahasa, 2022), mencakup penggunaan huruf miring istilah asing, penulisan huruf kapital, kata berimbuhan, dan tanda baca.
          </li>
          <li>
            <strong>Struktur Kalimat Efektif:</strong> Memiliki subjek dan predikat yang jelas, tidak ambigu, hemat kata, serta bebas dari kalimat menggantung (<em>fragment sentence</em>) dan kerancuan aktif-pasif (Jumadi et al., 2024).
          </li>
          <li>
            <strong>Integritas Akademik dan Pencegahan Plagiarisme:</strong> Setiap pemikiran atau data pihak lain wajib dicantumkan sumbernya dengan teknik pengutipan yang benar (kutipan langsung maupun parafrasa) dengan bantuan aplikasi pengelola referensi (Mendeley/Zotero) (Samal &amp; Ardianto, 2025).
          </li>
        </ol>
      </div>
    </section>
  );
}
