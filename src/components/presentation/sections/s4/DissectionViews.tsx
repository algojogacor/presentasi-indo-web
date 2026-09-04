import { PRELIM_ITEMS, CHAPTERS, POST_ITEMS } from "@/data/anatomy";

export function OverviewDissection() {
  return (
    <div>
      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
        TINJAUAN UMUM
      </p>
      <h2 className="mt-3 font-display text-[3.1vw] leading-[1.05] text-paper">
        Tiga rongga, <em className="text-ember italic">satu tubuh.</em>
      </h2>
      <p className="mt-5 max-w-[30vw] font-body text-[1.3vw] leading-relaxed text-paper/80">
        Anatomi KTI terbagi menjadi bagian awal (preliminaries), bagian
        inti (body text), dan bagian akhir (postliminaries). Setiap
        rongga menyimpan organ dengan fungsi spesifik — dan urutannya
        bukan gaya, melainkan logika.
      </p>
      <div className="mt-8 space-y-2.5 border-t border-edge pt-5 font-code text-[10px] leading-relaxed tracking-[0.18em] text-mute">
        <p className="p-row">
          <span className="text-ember">[ 1 ]</span> PRELIMINARIES — pintu masuk dokumen
        </p>
        <p className="p-row">
          <span className="text-ember">[ 2 ]</span> BODY TEXT — rongga argumen ·{" "}
          <span className="text-ember">[ A–E ]</span> bedah BAB I–V
        </p>
        <p className="p-row">
          <span className="text-ember">[ 3 ]</span> POSTLIMINARIES — bukti jejak
        </p>
      </div>
    </div>
  );
}

export function PrelimDissection() {
  return (
    <div>
      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
        BAGIAN AWAL — PRELIMINARIES
      </p>
      <h2 className="mt-3 font-display text-[2.7vw] leading-[1.05] text-paper">
        Pintu masuk dokumen.
      </h2>
      <div className="mt-6 space-y-[0.9vw]">
        {PRELIM_ITEMS.map((it) => (
          <div
            key={it[0]}
            className="p-row grid grid-cols-[2.4vw_13vw_1fr] items-baseline gap-[1.2vw] border-t border-edge pt-[0.7vw]"
          >
            <span className="font-code text-[10px] text-mute">{it[0]}</span>
            <span className="font-body text-[1.15vw] font-semibold text-paper">
              {it[1]}
            </span>
            <span className="font-body text-[1.1vw] text-mute">{it[2]}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 border-l-2 border-ember/70 pl-4 font-display italic text-[1.35vw] leading-snug text-paper/80">
        Fungsi bagian awal: pengantar sebelum pembaca memasuki
        substansi pokok karya ilmiah, sekaligus penegak legalitas.
      </p>
    </div>
  );
}

export function BodyDissection({ bab }: { bab: number }) {
  return (
    <div>
      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
        BAGIAN INTI — BODY TEXT
      </p>
      <h2 className="mt-3 font-display text-[2.7vw] leading-[1.05] text-paper">
        Rongga argumen.
      </h2>
      <div className="mt-6 space-y-2">
        {CHAPTERS.map((c, i) => {
          const sel = bab === i;
          return (
            <div
              key={c.k}
              className={`p-row border-l-2 py-[0.6vw] pl-[1.1vw] pr-3 rounded-r-[2px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                sel
                  ? "border-ember bg-ember/10"
                  : "border-edge bg-transparent hover:border-edge/80"
              }`}
            >
              <div className="flex items-baseline gap-[1vw]">
                <span
                  className={`font-code text-[10px] transition-colors duration-300 ${
                    sel ? "text-ember font-semibold" : "text-mute"
                  }`}
                >
                  {c.k}
                </span>
                <span
                  className={`font-body text-[1.2vw] font-semibold transition-colors duration-300 ${
                    sel ? "text-paper" : "text-paper/85"
                  }`}
                >
                  {c.title}
                </span>
                <span className="ml-auto hidden font-display text-[1vw] italic text-mute xl:inline">
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
                  <p className="max-w-[38vw] font-body text-[1.05vw] leading-relaxed text-paper/85 pt-1 pb-0.5">
                    {c.detail}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {bab === -1 && (
          <p className="fade-slide-in pt-2 font-code text-[10px] tracking-[0.2em] text-mute">
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
      <p className="font-code text-[10px] tracking-[0.3em] text-ember">
        BAGIAN AKHIR — POSTLIMINARIES
      </p>
      <h2 className="mt-3 font-display text-[2.7vw] leading-[1.05] text-paper">
        Bukti jejak.
      </h2>
      <div className="mt-6 space-y-[0.9vw]">
        {POST_ITEMS.map((it) => (
          <div
            key={it[0]}
            className="p-row grid grid-cols-[2.4vw_14vw_1fr] items-baseline gap-[1.2vw] border-t border-edge pt-[0.7vw]"
          >
            <span className="font-code text-[10px] text-mute">{it[0]}</span>
            <span className="font-body text-[1.15vw] font-semibold text-paper">
              {it[1]}
            </span>
            <span className="font-body text-[1.1vw] text-mute">{it[2]}</span>
          </div>
        ))}
      </div>
      <p className="mt-6 border-l-2 border-ember/70 pl-4 font-display italic text-[1.35vw] leading-snug text-paper/80">
        Bagian akhir memuat kelengkapan administratif dan akademis
        pendukung guna menjamin karakter verifikatif serta integritas sitasi.
      </p>
    </div>
  );
}
