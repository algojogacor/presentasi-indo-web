"use client";

/**
 * Bantuan presenter — lembar pintas keyboard lengkap.
 * [?] / [F1] membuka · [Esc]/[?] menutup · tombol lain ditelan saat terbuka.
 */

interface Group {
  title: string;
  items: [string, string][];
}

const GROUPS: Group[] = [
  {
    title: "NAVIGASI",
    items: [
      ["SPACE / →", "Langkah berikutnya (memotong animasi)"],
      ["←", "Langkah sebelumnya"],
      ["G + 0–8", "Lompat ke babak"],
      ["O / TAB", "Peta babak — klik atau angka untuk lompat"],
      ["L", "Lanjut dari posisi tersimpan (setelah refresh)"],
    ],
  },
  {
    title: "SESI & WAKTU",
    items: [
      ["T", "Mode rehearsal — auto-advance + patokan waktu 53′"],
      ["E", "Ekspor hasil polling (CSV) — di sesi interaktif"],
      ["R", "Reset suara polling — di sesi interaktif"],
      ["F", "Fallback manual polling — klik opsi di layar"],
    ],
  },
  {
    title: "BABAK TERPILIH",
    items: [
      ["1 / 2 / 3", "Anatomi — zona struktur"],
      ["A – E", "Anatomi — bedah BAB I–V"],
      ["1 – 4", "Variasi KTI — spotlight kartu"],
      ["B", "Variasi KTI — mode komparasi"],
      ["SHIFT + S", "Lewati video guest lecturer"],
    ],
  },
  {
    title: "TAMPILAN",
    items: [
      ["C", "Contrast boost — proyektor redup"],
      ["M", "Bisukan audio"],
      ["N", "Catatan presenter — panduan penyampaian per langkah"],
      ["H", "Sembunyikan baris bantuan HUD"],
      ["? / F1", "Lembar pintas ini"],
    ],
  },
];

export default function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] bg-base/95 backdrop-blur-[6px]"
      role="dialog"
      aria-modal="true"
      aria-label="Lembar bantuan presenter"
    >
      <div className="fade-slide-in absolute inset-0 flex flex-col items-center justify-center px-[8vw]">
        <p className="font-code text-[10px] tracking-[0.5em] text-ember">
          MEJA KENDALI PRESENTER
        </p>
        <h2 className="mt-3 font-display text-[3vw] text-paper">
          Pintas keyboard<span className="text-ember">.</span>
        </h2>
        <p className="mt-2.5 font-code text-[10px] tracking-[0.28em] text-mute">
          [ESC] MENUTUP — JAM TETAP BERJALAN
        </p>

        <div className="help-grid mt-[4vh] grid max-w-[74vw] grid-cols-2 gap-x-[4vw] gap-y-[2.4vh]">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="font-code text-[10px] tracking-[0.35em] text-ember">
                {g.title}
              </p>
              <div className="mt-[1vh] border-t border-edge">
                {g.items.map(([k, d]) => (
                  <div
                    key={k}
                    className="help-row flex items-baseline gap-[1.2vw] border-b border-edge py-[0.72vh]"
                  >
                    <span className="w-[9.5vw] shrink-0 font-code text-[10px] tracking-[0.12em] text-paper/85">
                      {k}
                    </span>
                    <span className="font-body text-[0.92vw] leading-snug text-paper/60">
                      {d}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-[3.2vh] border border-edge px-5 py-2 font-code text-[10px] tracking-[0.25em] text-mute transition-colors hover:border-ember/50 hover:text-ember focus-visible:border-ember/60 focus-visible:outline-1 focus-visible:outline-ember"
        >
          [ESC] TUTUP
        </button>
      </div>
    </div>
  );
}
