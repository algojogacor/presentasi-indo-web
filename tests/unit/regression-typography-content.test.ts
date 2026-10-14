import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QUESTIONS } from "../../src/lib/questions";
import { REFERENCES } from "../../src/data/bibliography";
import { PAPER_META } from "../../src/data/paperContent";
import { BATTLE_PAIRS } from "../../src/components/presentation/sections/s6/battleData";

describe("Regression: Typography Pass Content & Layout Integrity", () => {
  describe("1. Data & Text Content Preservation", () => {
    it("memastikan seluruh pertanyaan dan opsi live polling utuh dan tidak kosong", () => {
      expect(QUESTIONS.length).toBe(2);

      QUESTIONS.forEach((q) => {
        expect(q.prompt.trim().length).toBeGreaterThan(10);
        expect(q.answerNote.trim().length).toBeGreaterThan(15);
        expect(q.options.length).toBe(4);

        q.options.forEach((opt) => {
          expect(["A", "B", "C", "D"]).toContain(opt.key);
          expect(opt.label.trim().length).toBeGreaterThan(3);
        });

        // Tepat 1 kunci jawaban benar
        const correctCount = q.options.filter((o) => o.correct).length;
        expect(correctCount).toBe(1);
      });
    });

    it("memastikan metadata makalah dan daftar pustaka 12 sumber tetap lengkap", () => {
      expect(PAPER_META.title.length).toBeGreaterThan(10);
      expect(PAPER_META.group).toContain("Kelompok 6");
      expect(REFERENCES.length).toBe(12);

      REFERENCES.forEach((ref) => {
        expect(ref.authors.trim().length).toBeGreaterThan(3);
        expect(ref.title.trim().length).toBeGreaterThan(5);
        expect(ref.year).toBeGreaterThan(2000);
        expect(ref.source.trim().length).toBeGreaterThan(3);
      });
    });

    it("memastikan data kartu battle (Act 06) lengkap dengan 4 baris perbandingan dan catatan", () => {
      expect(BATTLE_PAIRS.length).toBe(2); // KTI vs Populer, KTI vs Fiksi

      BATTLE_PAIRS.forEach((pair) => {
        expect(pair.left.title.length).toBeGreaterThan(0);
        expect(pair.right.title.length).toBeGreaterThan(0);

        // Setiap kartu memiliki 4 baris perbandingan
        expect(pair.left.rows.length).toBe(4);
        expect(pair.right.rows.length).toBe(4);

        pair.left.rows.forEach((row) => {
          expect(row.label.length).toBeGreaterThan(0);
          expect(row.value.length).toBeGreaterThan(0);
        });

        expect(pair.left.note.length).toBeGreaterThan(5);
        expect(pair.right.note.length).toBeGreaterThan(5);
      });
    });
  });

  describe("2. Tailwind v4 Theme Color Collision Prevention", () => {
    const globalsCssPath = resolve(import.meta.dir, "../../src/app/globals.css");
    const globalsCss = readFileSync(globalsCssPath, "utf-8");

    it("tidak mendefinisikan --color-base di dalam @theme inline (mencegah bentrok text-base)", () => {
      // Jika @theme inline memiliki --color-base, Tailwind v4 akan men-generate class .text-base
      // yang meng-override font-size menjadi warna hitam (#0a0a0f), membuat teks tidak terlihat.
      const themeInlineMatch = globalsCss.match(/@theme\s+inline\s*\{([^}]+)\}/g);
      expect(themeInlineMatch).not.toBeNull();

      themeInlineMatch?.forEach((block) => {
        expect(block).not.toContain("--color-base:");
      });

      // Harus menggunakan --color-canvas sebagai pengganti
      expect(globalsCss).toContain("--color-canvas: #0a0a0f;");
    });

    it("menyediakan utility compatibility .bg-base untuk komponen yang menggunakan background gelap", () => {
      expect(globalsCss).toContain(".bg-base {");
      expect(globalsCss).toContain(".bg-base\\/95");
      expect(globalsCss).toContain(".bg-base\\/88");
    });
  });

  describe("3. Layout Collision & Clipping Invariants", () => {
    it("memastikan BattleCard tidak menggunakan absolute positioning yang menabrak baris kartu", () => {
      const battleCardPath = resolve(
        import.meta.dir,
        "../../src/components/presentation/sections/s6/BattleCard.tsx"
      );
      const battleCardCode = readFileSync(battleCardPath, "utf-8");

      // .card-note tidak boleh absolute pinned bottom
      expect(battleCardCode).not.toContain("absolute bottom-[1.2vw]");
      expect(battleCardCode).not.toContain("absolute bottom-");

      // Harus menggunakan flex column flow dengan mt-auto
      expect(battleCardCode).toContain("mt-auto");
      expect(battleCardCode).toContain("flex flex-col");
    });

    it("memastikan DissectionViews tidak menyembunyikan judul dengan breakpoint bertentangan", () => {
      const dissectionPath = resolve(
        import.meta.dir,
        "../../src/components/presentation/sections/s4/DissectionViews.tsx"
      );
      const dissectionCode = readFileSync(dissectionPath, "utf-8");

      // Tidak boleh ada split node sm:hidden vs hidden sm:inline yang merusak rendering canvas 16:9
      expect(dissectionCode).not.toContain("hidden sm:inline");
      expect(dissectionCode).toContain("text-paper font-semibold");
    });
  });
});
