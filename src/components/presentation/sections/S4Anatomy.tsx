"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { usePres } from "../context";
import { useIsoLayoutEffect, useSectionKeys } from "../hooks";
import { Kicker, BigNumeral } from "../atoms";

const ROMAN = ["I", "II", "III", "IV", "V"];

const PRELIM_ITEMS: [string, string, string][] = [
  ["01", "Halaman Judul", "Judul, tujuan penulisan, logo institusi, identitas penyusun, instansi, dan tahun"],
  ["02", "Halaman Pengesahan", "Tanda tangan pembimbing dan penguji sebagai bukti legalitas serta validitas"],
  ["03", "Abstrak & Kata Kunci", "Inti ringkas: latar belakang, tujuan, metode, hasil temuan, simpulan, serta 3–5 kata kunci"],
  ["04", "Kata Pengantar", "Ucapan syukur, maksud penulisan, apresiasi pihak pembantu, dan keterbukaan kritik/saran"],
  ["05", "Daftar Isi & Visual", "Navigasi halaman untuk bab, subbab, tabel, gambar, serta lampiran guna mempermudah pembaca"],
];

const CHAPTERS = [
  {
    k: "A",
    title: "BAB I — Pendahuluan",
    one: "Pola piramida terbalik & formulasi masalah.",
    detail:
      "1. Latar Belakang Masalah (pola piramida terbalik: isu umum, urgensi, gap penelitian, justifikasi topik); 2. Identifikasi & Pembatasan Masalah (penegasan fokus); 3. Rumusan Masalah (spesifik 5W1H); 4. Tujuan Penelitian (korespondensi 1:1); 5. Manfaat Penelitian (teoretis & praktis).",
  },
  {
    k: "B",
    title: "BAB II — Kajian Pustaka",
    one: "Landasan teoretis, novelty, & kerangka pikir.",
    detail:
      "1. Kajian Teori (konsep dan model mutakhir sebagai basis analisis); 2. Tinjauan Penelitian Terdahulu (pemetaan posisi & kebaruan/novelty); 3. Kerangka Berpikir (bagan alur penalaran hubungan variabel); 4. Hipotesis Penelitian (dugaan sementara uji statistik).",
  },
  {
    k: "C",
    title: "BAB III — Metodologi Penelitian",
    one: "Prosedur transparan untuk replikasi ilmiah.",
    detail:
      "1. Pendekatan & Jenis (kuantitatif, kualitatif, mixed methods, tindakan); 2. Tempat & Waktu; 3. Populasi, Sampel / Sumber Data & Teknik Sampling; 4. Teknik Pengumpulan Data; 5. Instrumen & Uji Validitas/Reliabilitas; 6. Teknik Analisis Data.",
  },
  {
    k: "D",
    title: "BAB IV — Hasil dan Pembahasan",
    one: "Penyajian data objektif & dialektika kritis.",
    detail:
      "1. Deskripsi Hasil (penyajian naratif, tabel, atau grafik data objektif temuan); 2. Pembahasan (bagian paling kritis: menafsirkan temuan, mengaitkannya dengan teori Bab II, membandingkan riset terdahulu, menjelaskan sebab hasil, serta limitasi penelitian).",
  },
  {
    k: "E",
    title: "BAB V — Penutup",
    one: "Jawaban rumusan masalah & rekomendasi.",
    detail:
      "1. Simpulan (ringkasan substantif yang menjawab rumusan masalah secara lugas berdasarkan pembahasan, bukan mengulang angka data mentah); 2. Saran (rekomendasi operasional bagi pihak terkait dan arah penelitian lanjutan/future research).",
  },
];

const POST_ITEMS: [string, string, string][] = [
  ["01", "Daftar Pustaka", "Seluruh rujukan in-text disusun alfabetis sesuai gaya baku (APA, Harvard, IEEE)"],
  ["02", "Lampiran (Appendices)", "Dokumen pelengkap detail: instrumen kuesioner, transkrip wawancara, perhitungan statistik mentah, surat izin"],
  ["03", "Riwayat Hidup (CV)", "Profil singkat rekam jejak akademis penulis (opsional pada skripsi atau laporan)"],
];

const ZONE_META: Record<number, { label: string; hex: string; rgba: (a: number) => string }> = {
  1: {
    label: "PRELIMINARIES",
    hex: "#E8A020",
    rgba: (a) => `rgba(232,160,32,${a})`,
  },
  2: {
    label: "BODY TEXT",
    hex: "#F0EDE8",
    rgba: (a) => `rgba(240,237,232,${a})`,
  },
  3: {
    label: "POSTLIMINARIES",
    hex: "#FFB740",
    rgba: (a) => `rgba(255,183,64,${a})`,
  },
};

/**
 * Section 4 — ANATOMY THEATER (centerpiece).
 * Split-screen: kiri lembar dokumen "rontgen", kanan panel bedah.
 * Step 0 overview · 1 Preliminaries · 2 Body Text · 3–7 BAB I–V (drill A–E) · 8 Postliminaries.
 */
export default function S4Anatomy({ step }: { step: number }) {
  const { setStep, settled } = usePres();
  const root = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const part = step === 1 ? 1 : step >= 2 && step <= 7 ? 2 : step === 8 ? 3 : 0;
  const bab = step >= 3 && step <= 7 ? step - 3 : -1;

  useSectionKeys((key) => {
    if (key === "1") {
      setStep(1);
      return true;
    }
    if (key === "2") {
      setStep(2);
      return true;
    }
    if (key === "3") {
      setStep(8);
      return true;
    }
    const idx = ["a", "b", "c", "d", "e"].indexOf(key);
    if (idx >= 0) {
      setStep(3 + idx);
      return true;
    }
    return false;
  });

  // Lembar dokumen naik saat section ini pertama kali masuk
  useIsoLayoutEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;
    if (settled) {
      gsap.set(sheet, { y: 0, autoAlpha: 1 });
      return;
    }
    gsap.fromTo(
      sheet,
      { y: 44, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out" },
    );
     
  }, []);

  // Panel kanan: transisi halus saat berganti rongga
  useIsoLayoutEffect(() => {
    const p = panelRef.current;
    if (!p) return;
    if (settled) {
      gsap.set(p, { autoAlpha: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      p,
      { autoAlpha: 0, y: 14 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.55,
        ease: "power2.out",
      },
    );
  }, [part]);

  // Baris panel muncul berurutan saat berganti rongga (bukan saat drill BAB)
  useIsoLayoutEffect(() => {
    const rows = panelRef.current?.querySelectorAll<HTMLElement>(".p-row");
    if (!rows || rows.length === 0) return;
    if (settled) {
      gsap.set(rows, { autoAlpha: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      rows,
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.07, delay: 0.12, ease: "power2.out", overwrite: "auto" },
    );
     
  }, [part]);

  // State rontgen: rongga terpilih menyala, dua lainnya tergeser & meredup
  useIsoLayoutEffect(() => {
    const q = root.current;
    if (!q) return;
    q.querySelectorAll<HTMLElement>(".zone").forEach((z) => {
      const p = Number(z.dataset.part);
      const meta = ZONE_META[p];
      const isSel = p === part && part !== 0;
      gsap.to(z, {
        opacity: part === 0 ? 0.35 : isSel ? 1 : 0.18,
        y: part === 0 || isSel ? 0 : p === 1 ? -10 : p === 3 ? 10 : 0,
        scaleY: part === 0 || isSel ? 1 : 0.88,
        borderColor: isSel ? meta.rgba(0.55) : "rgba(255,255,255,0.07)",
        duration: settled ? 0 : 0.65,
        ease: "power3.inOut",
        transformOrigin:
          p === 1 ? "top center" : p === 3 ? "bottom center" : "center",
      });
      const label = z.querySelector<HTMLElement>(".z-label");
      if (label)
        gsap.to(label, {
          color: isSel ? meta.hex : "#6B6B7A",
          opacity: part === 0 ? 0.75 : 1,
          duration: settled ? 0 : 0.5,
        });
      z.querySelectorAll<HTMLElement>(".z-tag").forEach((t) =>
        gsap.to(t, { opacity: isSel ? 0.85 : 0, duration: settled ? 0 : 0.45 }),
      );
      z.querySelectorAll<HTMLElement>(".z-line, .z-block").forEach((b) =>
        gsap.to(b, { opacity: isSel ? 1 : 0.4, duration: settled ? 0 : 0.5 }),
      );
    });

    // Drill-down BAB: segmen terpilih melebar, sub-struktur terbuka
    q.querySelectorAll<HTMLElement>(".bab").forEach((b, i) => {
      const sel = part === 2 && bab === i;
      gsap.to(b, {
        flexGrow: sel ? 2.4 : 1,
        borderColor: sel ? "rgba(240,237,232,0.4)" : "rgba(255,255,255,0.05)",
        backgroundColor: sel ? "rgba(240,237,232,0.045)" : "rgba(240,237,232,0)",
        duration: settled ? 0 : 0.55,
        ease: "power2.inOut",
      });
      const sub = b.querySelector<HTMLElement>(".bab-sub");
      if (sub) {
        if (sel) {
          gsap.set(sub, { display: "flex" });
          gsap.fromTo(
            sub,
            { height: 0, autoAlpha: 0 },
            { height: "auto", autoAlpha: 1, duration: settled ? 0 : 0.5, ease: "power2.out" },
          );
        } else {
          gsap.to(sub, {
            height: 0,
            autoAlpha: 0,
            duration: settled ? 0 : 0.3,
            onComplete: () => gsap.set(sub, { display: "none" }),
          });
        }
      }
      const ttl = b.querySelector<HTMLElement>(".bab-title");
      if (ttl)
        gsap.to(ttl, {
          autoAlpha: part === 2 ? (sel ? 1 : 0.6) : 0,
          duration: settled ? 0 : 0.4,
        });
      const num = b.querySelector<HTMLElement>(".bab-num");
      if (num)
        gsap.to(num, {
          color: sel ? "#FFB740" : "#6B6B7A",
          duration: settled ? 0 : 0.4,
        });
    });
  }, [part, bab, settled]);

  return (
    <div
      ref={root}
      className="absolute inset-0 px-[6vw] pt-[11vh] pb-[7vh]"
      data-testid="anatomy-theater"
    >
      <Kicker act="04">ANATOMY THEATER</Kicker>
      <BigNumeral>04</BigNumeral>

      <div className="grid h-full grid-cols-[45%_55%] items-center gap-[2.5vw]">
        {/* ============ KIRI — lembar rontgen ============ */}
        <div className="relative flex flex-col items-center">
          <div
            ref={sheetRef}
            className="relative h-[min(62vh,64vw)] border border-edge bg-[#0C0C13] opacity-0"
            style={{ aspectRatio: "1 / 1.414" }}
          >
            {/* tanda pojok bidang rontgen */}
            {["-top-2 -left-2", "-top-2 -right-2", "-bottom-2 -left-2", "-bottom-2 -right-2"].map(
              (pos) => (
                <span
                  key={pos}
                  aria-hidden
                  className={`absolute ${pos} font-code text-[10px] text-ember/40 select-none`}
                >
                  +
                </span>
              ),
            )}
            <p className="absolute top-2.5 left-1/2 -translate-x-1/2 font-code text-[8px] tracking-[0.3em] text-mute">
              DOKUMEN · KTI — RONTGEN STRUKTURAL
            </p>
            <div className="scanline" aria-hidden />

            <div className="absolute inset-x-3 top-8 bottom-3 flex flex-col gap-[4px]">
              {/* --- ZONE 1: PRELIMINARIES --- */}
              <div
                data-part="1"
                className="zone relative flex h-[21%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
              >
                <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                  PRELIMINARIES
                </span>
                <div className="flex flex-1 flex-col gap-[5px] pt-1">
                  <div className="z-line h-[7px] w-[58%] self-center bg-ember/55" />
                  <div className="z-line h-[3px] w-[28%] self-center bg-white/16" />
                  <div className="z-line h-[3px] w-[72%] self-center bg-white/16" />
                  <div className="z-block flex flex-col gap-[3px] border border-white/14 p-1">
                    <div className="z-line h-[2px] w-[88%] bg-white/16" />
                    <div className="z-line h-[2px] w-[94%] bg-white/16" />
                    <div className="z-line h-[2px] w-[62%] bg-white/16" />
                    <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                      ABSTRAK
                    </span>
                  </div>
                  <div className="flex flex-col gap-[3px]">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="z-line h-[2px] flex-1 bg-white/16" />
                        <div className="z-line h-[2px] w-[7px] bg-white/28" />
                      </div>
                    ))}
                    <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                      DAFTAR ISI
                    </span>
                  </div>
                </div>
              </div>

              {/* --- ZONE 2: BODY TEXT --- */}
              <div
                data-part="2"
                className="zone relative flex h-[55%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
              >
                <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                  BODY TEXT
                </span>
                <div className="flex flex-1 flex-col gap-[3px] pt-1">
                  {ROMAN.map((r, i) => (
                    <div
                      key={r}
                      data-bab={i}
                      className="bab relative flex flex-1 flex-col justify-center rounded-[2px] border border-white/5 px-1.5"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="bab-num font-code text-[7px] text-mute">
                          {r}
                        </span>
                        <div
                          className="bab-bar h-[3px] bg-white/16"
                          style={{ width: `${78 - i * 6}%` }}
                        />
                      </div>
                      <span className="bab-title absolute right-2 top-0.5 font-code text-[7px] tracking-[0.16em] text-paper/70 opacity-0">
                        BAB {r} — {["PENDAHULUAN", "TINJAUAN PUSTAKA", "METODE", "HASIL & PEMBAHASAN", "SIMPULAN & SARAN"][i]}
                      </span>
                      <div className="bab-sub hidden flex-col gap-[2px] overflow-hidden pt-[3px] opacity-0">
                        <div className="h-[2px] w-[92%] bg-white/22" />
                        <div className="h-[2px] w-[86%] bg-white/22" />
                        <div className="h-[2px] w-[90%] bg-white/22" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* --- ZONE 3: POSTLIMINARIES --- */}
              <div
                data-part="3"
                className="zone relative flex h-[24%] flex-col rounded-[2px] border border-edge px-1.5 opacity-35"
              >
                <span className="z-label font-code text-[8px] tracking-[0.28em] text-mute">
                  POSTLIMINARIES
                </span>
                <div className="flex flex-1 flex-col gap-[5px] pt-1">
                  <div className="flex flex-col gap-[3px] pl-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="z-line h-[2px] bg-white/16" style={{ width: `${88 - i * 8}%` }} />
                    ))}
                    <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                      DAFTAR PUSTAKA
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pl-1.5">
                    <div className="z-line h-[10px] w-[10px] border border-white/20" />
                    <div className="z-line h-[10px] w-[10px] border border-white/20" />
                    <div className="z-line h-[3px] w-[40%] bg-white/16" />
                    <span className="z-tag font-code text-[7px] tracking-[0.2em] text-ember opacity-0">
                      LAMPIRAN
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 font-code text-[9px] tracking-[0.25em] text-mute">
            SPECIMEN 01 — KTI/GENERIK · SKALA 1:√2
          </p>
        </div>

        {/* ============ KANAN — panel bedah ============ */}
        <div
          ref={panelRef}
          className="max-h-[70vh] overflow-y-auto pr-1"
          data-part={part}
        >
          {part === 0 && (
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
          )}

          {part === 1 && (
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
          )}

          {part === 2 && (
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
          )}

          {part === 3 && (
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
          )}
        </div>
      </div>
    </div>
  );
}
