import { PRELIM_ITEMS, CHAPTERS, POST_ITEMS } from "@/data/anatomy";

export function OverviewDissection() {
  return (
    <div>
      <p className="font-code text-xs md:text-sm tracking-[0.3em] text-ember font-medium">
        TINJAUAN UMUM
      </p>
      <h2 className="mt-2.5 sm:mt-3 font-display text-[clamp(1.8rem,3.2vw,3.3rem)] leading-[1.05] text-paper">
        Tiga rongga, <em className="text-ember italic">satu tubuh.</em>
      </h2>
      <p className="mt-3.5 sm:mt-5 max-w-full md:max-w-[34vw] font-body text-sm sm:text-base md:text-[1.35vw] leading-relaxed text-paper/85">
        Anatomi KTI terbagi menjadi bagian awal (preliminaries), bagian
        inti (body text), dan bagian akhir (postliminaries). Setiap
        rongga menyimpan organ dengan fungsi spesifik — dan urutannya
        bukan gaya, melainkan logika.
      </p>
      <div className="mt-5 sm:mt-8 space-y-2.5 sm:space-y-3 border-t border-edge pt-4 sm:pt-5 font-code text-xs sm:text-sm leading-relaxed tracking-[0.16em] sm:tracking-[0.18em] text-mute/85">
        <p className="p-row">
          <span className="text-ember font-bold">[ 1 ]</span> PRELIMINARIES — pintu masuk dokumen
        </p>
        <p className="p-row">
          <span className="text-ember font-bold">[ 2 ]</span> BODY TEXT — rongga argumen ·{" "}
          <span className="text-ember font-bold">[ A–E ]</span> bedah BAB I–V
        </p>
        <p className="p-row">
          <span className="text-ember font-bold">[ 3 ]</span> POSTLIMINARIES — bukti jejak
        </p>
      </div>
    </div>
  );
}

export function PrelimDissection() {
  return (
    <div>
      <p className="font-code text-xs md:text-sm tracking-[0.3em] text-ember font-medium">
        BAGIAN AWAL — PRELIMINARIES
      </p>
      <h2 className="mt-2.5 sm:mt-3 font-display text-[clamp(1.8rem,3vw,3.2rem)] leading-[1.05] text-paper">
        Pintu masuk dokumen.
      </h2>
      <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-[0.95vw]">
        {PRELIM_ITEMS.map((it) => (
          <div
            key={it[0]}
            className="p-row grid grid-cols-[2.5rem_13rem_1fr] md:grid-cols-[2.8vw_14vw_1fr] items-baseline gap-2 sm:gap-[1.2vw] border-t border-edge pt-2.5 sm:pt-[0.8vw]"
          >
            <span className="font-code text-xs md:text-sm font-semibold text-mute">{it[0]}</span>
            <span className="font-body text-sm md:text-[1.3vw] font-semibold text-paper">
              {it[1]}
            </span>
            <span className="font-body text-xs md:text-[1.2vw] text-paper/75 leading-snug">{it[2]}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 sm:mt-7 border-l-2 border-ember/70 pl-3.5 sm:pl-4 font-display italic text-sm md:text-[1.35vw] leading-snug text-paper/90">
        Fungsi bagian awal: pengantar sebelum pembaca memasuki
        substansi pokok karya ilmiah, sekaligus penegak legalitas.
      </p>
    </div>
  );
}

export function BodyDissection({ bab }: { bab: number }) {
  return (
    <div>
      <p className="font-code text-xs md:text-sm tracking-[0.3em] text-ember font-medium">
        BAGIAN INTI — BODY TEXT
      </p>
      <h2 className="mt-2.5 sm:mt-3 font-display text-[clamp(1.8rem,3vw,3.2rem)] leading-[1.05] text-paper">
        Rongga argumen.
      </h2>
      <div className="mt-4 sm:mt-6 space-y-2.5">
        {CHAPTERS.map((c, i) => {
          const sel = bab === i;
          return (
            <div
              key={c.k}
              className={`p-row border-l-2 py-2 sm:py-[0.7vh] pl-3 sm:pl-[1.2vw] pr-3 rounded-r-[2px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                sel
                  ? "border-ember bg-ember/10"
                  : "border-edge bg-transparent hover:border-edge/80"
              }`}
            >
              <div className="flex items-baseline gap-2.5 sm:gap-[1vw]">
                <span
                  className={`font-code text-xs md:text-sm transition-colors duration-300 ${
                    sel ? "text-ember font-bold" : "text-mute"
                  }`}
                >
                  {c.k}
                </span>
                <span
                  className={`font-body text-sm md:text-[1.35vw] font-semibold transition-colors duration-300 ${
                    sel ? "text-paper" : "text-paper/85"
                  }`}
                >
                  {c.title}
                </span>
                <span className="ml-auto hidden font-display text-xs md:text-[1.1vw] italic text-mute/80 xl:inline">
                  {c.one}
                </span>
              </div>
              <div
                className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  sel
                    ? "grid-rows-[1fr] opacity-100 mt-2"
                    : "grid-rows-[0fr] opacity-0 mt-0 pointer-events-none"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="max-w-full md:max-w-[44vw] font-body text-xs md:text-[1.2vw] leading-relaxed text-paper/90 pt-1.5 pb-0.5">
                    {c.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {bab === -1 && (
          <p className="fade-slide-in pt-2 font-code text-xs sm:text-sm tracking-[0.2em] text-mute/80 font-medium">
            [ A–E ] BEDAH BAB SATU PER SATU
          </p>
        )}
      </div>
    </div>
  );
}

export function PostDissection() {
  return (
    <div>
      <p className="font-code text-xs md:text-sm tracking-[0.3em] text-ember font-medium">
        BAGIAN AKHIR — POSTLIMINARIES
      </p>
      <h2 className="mt-2.5 sm:mt-3 font-display text-[clamp(1.8rem,3vw,3.2rem)] leading-[1.05] text-paper">
        Bukti jejak.
      </h2>
      <div className="mt-4 sm:mt-6 space-y-2.5 sm:space-y-[0.95vw]">
        {POST_ITEMS.map((it) => (
          <div
            key={it[0]}
            className="p-row grid grid-cols-[2.5rem_13rem_1fr] md:grid-cols-[2.8vw_15vw_1fr] items-baseline gap-2 sm:gap-[1.2vw] border-t border-edge pt-2.5 sm:pt-[0.8vw]"
          >
            <span className="font-code text-xs md:text-sm font-semibold text-mute">{it[0]}</span>
            <span className="font-body text-sm md:text-[1.3vw] font-semibold text-paper">
              {it[1]}
            </span>
            <span className="font-body text-xs md:text-[1.2vw] text-paper/75 leading-snug">{it[2]}</span>
          </div>
        ))}
      </div>
      <p className="mt-5 sm:mt-7 border-l-2 border-ember/70 pl-3.5 sm:pl-4 font-display italic text-sm md:text-[1.35vw] leading-snug text-paper/90">
        Bagian akhir memuat kelengkapan administratif dan akademis
        pendukung guna menjamin karakter verifikatif serta integritas sitasi.
      </p>
    </div>
  );
}
