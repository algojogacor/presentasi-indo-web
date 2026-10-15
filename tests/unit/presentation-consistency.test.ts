import { describe, it, expect } from "bun:test";
import { SECTIONS } from "@/components/presentation/context";
import { SECTION_COMPONENTS } from "@/components/presentation/sections";
import { SPEAKER_NOTES, getSpeakerNote } from "@/data/speakerNotes";
import { NOTE_PLAN } from "@/lib/notesData";
import { QUESTIONS } from "@/lib/questions";
import { CARDS } from "@/data/battle";
import { REFERENCES } from "@/data/bibliography";
import { SIMPULAN, SIMPULAN_METAS } from "@/data/closing";
import { BASE_CANVAS_WIDTH, BASE_CANVAS_HEIGHT } from "@/lib/canvasScale";

describe("Unit: Makalah & Presentation Consistency Audit", () => {
  describe("1. Total Steps & Coverage Matrix (55 Langkah / 9 Babak)", () => {
    it("memastikan terdapat tepat 9 Babak (Act 00 - Act 08)", () => {
      expect(SECTIONS.length).toBe(9);
      expect(SECTION_COMPONENTS.length).toBe(9);
      expect(NOTE_PLAN.length).toBe(9);
    });

    it("memastikan jumlah langkah per babak persis sesuai matriks presentasi", () => {
      const expectedSteps = [3, 4, 8, 8, 9, 5, 6, 3, 9];
      const actualSteps = SECTIONS.map((s) => s.steps);
      expect(actualSteps).toEqual(expectedSteps);

      const totalSteps = actualSteps.reduce((a, b) => a + b, 0);
      expect(totalSteps).toBe(55);
    });

    it("memastikan 100% dari 55 langkah memiliki naskah pembicara lengkap di SPEAKER_NOTES", () => {
      let count = 0;
      SECTIONS.forEach((sec, secIdx) => {
        for (let st = 0; st < sec.steps; st++) {
          const key = `s${secIdx}_${st}`;
          const note = SPEAKER_NOTES[key];
          expect(note).toBeDefined();
          expect(note.id).toBe(key);
          expect(note.section).toBe(secIdx);
          expect(note.step).toBe(st);
          expect(note.spokenScript.trim().length).toBeGreaterThan(20);
          expect(note.keyMessage.trim().length).toBeGreaterThan(5);
          expect(note.visualContext.trim().length).toBeGreaterThan(5);
          expect(Array.isArray(note.deliveryTips)).toBe(true);
          expect(note.deliveryTips.length).toBeGreaterThanOrEqual(1);
          count++;
        }
      });
      expect(count).toBe(55);
    });

    it("memastikan getSpeakerNote mengembalikan naskah yang identik untuk seluruh step", () => {
      SECTIONS.forEach((sec, secIdx) => {
        for (let st = 0; st < sec.steps; st++) {
          const note = getSpeakerNote(secIdx, st);
          expect(note).toBeDefined();
          expect(note?.id).toBe(`s${secIdx}_${st}`);
        }
      });
    });
  });

  describe("2. Penyelarasan Materi Slide & Naskah dengan Makalah (Single Source of Truth)", () => {
    it("Act 00: Menampilkan identitas makalah Kelompok 6 PDB 93 dan Dosen Pembimbing", () => {
      const s0_2 = SPEAKER_NOTES["s0_2"];
      expect(s0_2.spokenScript).toContain("Kelompok 6");
      expect(s0_2.spokenScript).toContain("PDB 93");
      expect(s0_2.spokenScript).toContain("Universitas Airlangga");
    });

    it("Act 02: Memuat kutipan Musdalifah et al. (2025) dan Baharuddin et al. (2025)", () => {
      const s2_0 = SPEAKER_NOTES["s2_0"];
      const s2_1 = SPEAKER_NOTES["s2_1"];
      const s2_2 = SPEAKER_NOTES["s2_2"];
      const combined = `${s2_0.spokenScript} ${s2_1.spokenScript} ${s2_2.spokenScript}`;
      expect(combined).toContain("Musdalifah");
      expect(combined).toContain("Baharuddin");
    });

    it("Act 02: Memuat 4 Rumusan Masalah dan urgensi penelitian sesuai Sub-bab 1.2–1.4", () => {
      const s2_4 = SPEAKER_NOTES["s2_4"];
      expect(s2_4.spokenScript).toContain("merumuskan empat agenda");

      const s2_5 = SPEAKER_NOTES["s2_5"];
      expect(s2_5.spokenScript).toContain("struktur anatomi KTI berstandar baku");

      const s2_6 = SPEAKER_NOTES["s2_6"];
      expect(s2_6.spokenScript).toContain("makalah");
      expect(s2_6.spokenScript).toContain("artikel jurnal");
      expect(s2_6.spokenScript).toContain("skripsi");
      expect(s2_6.spokenScript).toContain("Program Kreativitas Mahasiswa (PKM)");

      const s2_7 = SPEAKER_NOTES["s2_7"];
      expect(s2_7.spokenScript).toContain("EYD Edisi Kelima");
      expect(s2_7.spokenScript).toContain("manfaat");
    });

    it("Act 03: Memuat 3 definisi (KBBI 2024, Wulandari et al. 2024, Samal & Ardianto 2025) & 5 karakteristik (Widiyastuti et al. 2023)", () => {
      const s3_0 = SPEAKER_NOTES["s3_0"];
      const s3_1 = SPEAKER_NOTES["s3_1"];
      const s3_2 = SPEAKER_NOTES["s3_2"];
      const combinedDef = `${s3_0.spokenScript} ${s3_1.spokenScript} ${s3_2.spokenScript}`;
      expect(combinedDef).toContain("KBBI");
      expect(combinedDef).toContain("Wulandari");
      expect(combinedDef).toContain("Samal");

      const s3_3 = SPEAKER_NOTES["s3_3"];
      expect(s3_3.spokenScript).toContain("Widiyastuti");
    });

    it("Act 04: Memuat struktur anatomi 3 rongga dan Bab I–V", () => {
      const s4_0 = SPEAKER_NOTES["s4_0"];
      expect(s4_0.spokenScript).toContain("Preliminaries");
      expect(s4_0.spokenScript).toContain("Body Text");
      expect(s4_0.spokenScript).toContain("Postliminaries");

      const s4_5 = SPEAKER_NOTES["s4_5"];
      expect(s4_5.spokenScript).toContain("BAB III adalah Metode Penelitian");

      const s4_7 = SPEAKER_NOTES["s4_7"];
      expect(s4_7.spokenScript).toContain("BAB V berisi Simpulan dan Saran");

      const s4_8 = SPEAKER_NOTES["s4_8"];
      expect(s4_8.spokenScript).toContain("Postliminaries");
    });

    it("Act 05: Pertanyaan 1 & 2 sinkron 1:1 antara questions.ts, slide, dan naskah pembicara", () => {
      expect(QUESTIONS.length).toBe(2);

      // Pertanyaan 1: Mitos Tebal vs PKM / Jurnal
      const q1 = QUESTIONS[0];
      expect(q1.prompt).toContain("halamannya tebal");
      const q1Correct = q1.options.find((o) => o.correct);
      expect(q1Correct?.key).toBe("B");
      expect(q1Correct?.label).toContain("PKM");

      const s5_1 = SPEAKER_NOTES["s5_1"];
      expect(s5_1.keyMessage).toContain("pertanyaan 1");

      const s5_2 = SPEAKER_NOTES["s5_2"];
      expect(s5_2.spokenScript).toContain("Opsi B");
      expect(s5_2.spokenScript).toContain("PKM");

      // Pertanyaan 2: Kesalahan Fatal Ditolak Dosen / EYD & Plagiarisme
      const q2 = QUESTIONS[1];
      expect(q2.prompt).toContain("kesalahan fatal");
      const q2Correct = q2.options.find((o) => o.correct);
      expect(q2Correct?.key).toBe("C");
      expect(q2Correct?.label).toContain("EYD");

      const s5_3 = SPEAKER_NOTES["s5_3"];
      expect(s5_3.spokenScript).toContain("kesalahan fatal");

      const s5_4 = SPEAKER_NOTES["s5_4"];
      expect(s5_4.spokenScript).toContain("Opsi C");
      expect(s5_4.spokenScript).toContain("EYD");
    });

    it("Act 06: Data 4 kartu battle memuat variasi KTI sesuai Tabel 2 Makalah", () => {
      expect(CARDS.length).toBe(4);
      expect(CARDS.map((c) => c.title)).toEqual([
        "Makalah",
        "Artikel Jurnal",
        "Skripsi / Tesis",
        "Proposal PKM",
      ]);

      const pkmCard = CARDS[3];
      expect(pkmCard.rows.some((r) => r.v.includes("10 halaman"))).toBe(true);
      expect(pkmCard.rows.some((r) => r.v.includes("Dikti, 2023"))).toBe(true);

      const jurnalCard = CARDS[1];
      expect(jurnalCard.rows.some((r) => r.v.includes("IMRaD"))).toBe(true);
      expect(jurnalCard.rows.some((r) => r.v.includes("novelty"))).toBe(true);
    });

    it("Act 07: Memuat rujukan EYD V (Kepmendikbudristek 0424/P/2022) dan Samal & Ardianto (2025)", () => {
      const s7_0 = SPEAKER_NOTES["s7_0"];
      expect(s7_0.spokenScript).toContain("EYD");

      const s7_2 = SPEAKER_NOTES["s7_2"];
      expect(s7_2.spokenScript).toContain("Samal");
      expect(s7_2.spokenScript).toContain("Ardianto");
    });

    it("Act 08: Memuat 4 Butir Simpulan Makalah (Sub-bab 3.1) dan 12 Referensi APA 7th", () => {
      expect(SIMPULAN.length).toBe(4);
      expect(SIMPULAN_METAS.length).toBe(4);

      // Verifikasi 4 butir simpulan verbatim dari makalah
      expect(SIMPULAN[0]).toContain("data primer dan data sekunder");
      expect(SIMPULAN[1]).toContain("tiga bagian utama");
      expect(SIMPULAN[2]).toContain("fleksibilitas sesuai wadah");
      expect(SIMPULAN[3]).toContain("keharmonisan logika antar bab");

      // Verifikasi 12 referensi
      expect(REFERENCES.length).toBe(12);
      const authorsList = REFERENCES.map((r) => r.authors).join(" ");
      expect(authorsList).toContain("Baharuddin");
      expect(authorsList).toContain("Musdalifah");
      expect(authorsList).toContain("Sugiyono");
      expect(authorsList).toContain("Wulandari");
      expect(authorsList).toContain("Widiyastuti");
      expect(authorsList).toContain("Samal");
      expect(authorsList).toContain("Nugraha");
      expect(authorsList).toContain("Fitriani");
      expect(authorsList).toContain("Jumadi");
    });
  });

  describe("3. Larangan Halusinasi & Entitas Asing", () => {
    it("tidak mengandung entitas asing di luar makalah pada seluruh 55 naskah pembicara", () => {
      const forbiddenTerms = [
        "unesco",
        "brotowidjoyo",
        "jones (1960)",
        "kertas kerja",
      ];

      for (const [key, note] of Object.entries(SPEAKER_NOTES)) {
        const fullContent = `${note.stepTitle} ${note.keyMessage} ${note.spokenScript}`.toLowerCase();
        for (const term of forbiddenTerms) {
          expect(fullContent).not.toContain(term);
        }
      }
    });
  });

  describe("4. Integritas Dimensi Kanvas Virtual (1280x720) Antar Mode", () => {
    it("memastikan konstanta kanvas baku berukuran 1280x720 (16:9)", () => {
      expect(BASE_CANVAS_WIDTH).toBe(1280);
      expect(BASE_CANVAS_HEIGHT).toBe(720);
      expect(BASE_CANVAS_WIDTH / BASE_CANVAS_HEIGHT).toBeCloseTo(16 / 9, 3);
    });
  });
});
