# Worklog — "Anatomi Karya Tulis Ilmiah" (Kelompok 6 PDB 93, Universitas Airlangga)

Presentasi web "Academic Theater": dark, sinematik, editorial. Single route `/`
(Next.js 16 App Router, port 3000). Voting audiens via hash route `/#/voting`.
Backend polling via Next.js API routes + Prisma SQLite (adaptasi dari rencana
Hono/Turso pada brief karena batasan sandbox — kontrak endpoint identik).

---
Task ID: 0
Agent: main (Z.ai Code)
Task: Inisialisasi proyek — kontrak data polling bersama, worklog, dependensi

Work Log:
- Inspeksi scaffold: Next.js 16, React 19, Tailwind 4, Prisma 6 (sqlite via
  env DATABASE_URL), dev server sudah jalan di :3000 (HTTP 200).
- Menyusun arsitektur state navigasi `[sectionIndex, stepIndex]` (ACT.00–08)
  dengan step-map: [2,3,4,9,5,6,6,3,6] (jumlah langkah per section).
- Mendefinisikan kontrak polling bersama di `src/lib/questions.ts` (2 pertanyaan,
  opsi A–D, jawaban benar + catatan penjelasan) — dipakai frontend presentasi,
  halaman voting, dan validasi API backend.
- Menginstal dependensi: `gsap` (animasi + TextPlugin/ScrambleTextPlugin/Flip),
  `qrcode` + `@types/qrcode` (QR /api/qr server-side).

Stage Summary:
- Kontrak polling FINAL (tidak boleh berubah tanpa koordinasi):
  - POST /api/vote   body {question: 1|2, option: "A"|"B"|"C"|"D"} → {ok:true}
  - GET  /api/results?question=1|2 → {question, total, options:[{key,label,count}]}
  - POST /api/reset  → {ok:true} (truncate votes)
  - GET  /api/qr?data=<url> → SVG QR (amber di atas #0A0A0F)
- Split kerja: Task 1 (backend) diserahkan ke subagent; frontend dikerjakan main.
- Section map: 0 Opening, 1 Guest Lecturer (YouTube E6pPlIvlrPs), 2 Latar,
  3 Hakikat+Karakteristik, 4 Anatomy Theater, 5 Live Polling, 6 Battle Cards,
  7 Kaidah, 8 Penutup.

---
Task ID: 1
Agent: full-stack-developer (backend)
Task: Backend polling — Prisma Vote model + /api/vote + /api/results + /api/reset + /api/qr

Work Log:
- Baca worklog.md Task 0: kontrak polling final (POST /api/vote, GET /api/results,
  POST /api/reset, GET /api/qr) + helper bersama `src/lib/questions.ts`
  (QUESTIONS, isOptionValid, getQuestion, ResultsPayload) — dipakai apa adanya,
  tidak diubah.
- Edit `prisma/schema.prisma`: tambah model `Vote` (id cuid, question Int,
  option String, createdAt, @@index([question, option])) tanpa menyentuh
  model User/Post yang sudah ada.
- `bun run db:push` (sukses, auto-generate Prisma Client v6.19.2) — tabel Vote
  terbentuk di `db/custom.db`.
- Probe smoke-test model Vote via skrip bun sementara (create→delete) untuk
  memastikan Prisma Client mengenali model baru; probe dibersihkan.
- Buat `src/app/api/vote/route.ts` (POST): parse JSON body, validasi tipe
  {question: number, option: string} + `isOptionValid(question, option)` →
  400 `{ok:false,error}` bila invalid (body rusak / question 3 / opsi "Z" /
  field hilang), `db.vote.create` → 200 `{ok:true}`, db error → 500.
- Buat `src/app/api/results/route.ts` (GET): query param `?question=` (default 1;
  selain 1|2 → 400), `db.vote.groupBy({by:['option'], where, _count:{_all:true}})`,
  susun payload persis `ResultsPayload` — label dari QUESTIONS, count zero-filled
  untuk opsi tanpa suara, `total` = jumlah semua count.
- Buat `src/app/api/reset/route.ts` (POST): `db.vote.deleteMany({})` → `{ok:true}`.
- Buat `src/app/api/qr/route.ts` (GET): param `?data=` (wajib, minimal 8 karakter
  else 400), `import QRCode from 'qrcode'` (default import bekerja normal di
  runtime — fallback dynamic import tidak diperlukan), render SVG dengan margin 2,
  width 320, EC level M, warna dark #E8A020 / light #0A0A0F; response headers
  `content-type: image/svg+xml` + `cache-control: public, max-age=3600`.
- `bun run lint` → 0 error 0 warning.
- Verifikasi curl terhadap dev server :3000 (log dev.log bersih, tidak ada error):
  - POST /api/vote {q:1,B} & {q:2,C} → 200 {"ok":true}
  - GET /api/results?question=1|2 → shape kontrak, B=1 / C=1, zero-filled benar
  - GET /api/results (tanpa param) → question 1; question=3 → 400
  - POST /api/reset → {"ok":true}; results setelahnya total=0 semua
  - GET /api/qr?data=http%3A%2F%2Flocalhost%3A3000%2F%23%2Fvoting → SVG 320x320,
    #E8A020 di atas #0A0A0F, headers benar; data=abc / tanpa data → 400
  - Vote invalid: question 3, opsi "Z", field hilang, JSON rusak → semua 400
- Tidak menyentuh page.tsx, layout.tsx, globals.css, questions.ts, components/**,
  api/route.ts (sesuai batasan Task 1).

Stage Summary:
- 4 endpoint live-polling FINAL & terverifikasi sesuai kontrak Task 0:
  - POST /api/vote — validasi ketat (tipe + opsi per pertanyaan), 200/400/500.
  - GET  /api/results?question=1|2 — {question,total,options:[{key,label,count}]},
    label dari QUESTIONS, zero-filled, default question=1, non-1/2 → 400.
  - POST /api/reset — truncate tabel Vote.
  - GET  /api/qr?data=<url> — SVG QR amber (#E8A020) di atas #0A0A0F, EC-M,
    cache 1 jam, min 8 karakter else 400.
- Skema: model Vote ditambahkan (User/Post tak tersentuh), index (question,option)
  mendukung query groupBy per pertanyaan.
- Lint bersih; semua verifikasi via curl lolos (termasuk kasus invalid).
- Deviasi: tidak ada. Fallback dynamic import QRCode tidak dibutuhkan karena
  default import `qrcode` berjalan normal di route handler Next 16.
- Catatan untuk task frontend: voting bebas multi-submit (tanpa dedup per device)
  sesuai kontrak Task 0 — gunakan /api/reset untuk demo bersih.

---
Task ID: 2-9 (frontend lengkap + QA)
Agent: main (Z.ai Code)
Task: Design system, presentation engine, seluruh 9 section, voting page, integrasi, QA agent-browser

Work Log:
- Task 2 — layout.tsx: Google Fonts <link> (Cormorant Garamond / IBM Plex Sans /
  IBM Plex Mono), lang="id", metadata. Geist dihapus total. globals.css: token
  @theme inline (base/surface/paper/mute/ember/edge/wrong + font-display/body/code),
  contrast-boost via var(--edge)/var(--mute), grain feTurbulence, scanline rontgen,
  dot-live blink, ambient-word float, [data-step] & [data-char] initial hidden.
- Task 3 — Experience.tsx: state [section,step] dengan seenRef (jump kembali =
  settle instan tanpa replay), keyboard global (Space/→/← advance, G+digit jump,
  C contrast, M mute, Shift+S skip video), HUD kiri-bawah `ACT.0X // STEP.0X`
  + pesan transient, registerTimeline (Space memotong timeline aktif),
  registerKeyHandler (shortcut khusus section). audio.ts: thump sub-bass 40-54Hz
  + tick mekanis via OscillatorNode (tanpa file MP3).
- Task 4 — S0: gate `[SPACE] — MULAI` (membuka izin AudioContext), scrambleText
  → jeda 1.2s → judul per karakter (SplitChars + mask) + thump + kredit;
  kalimat final diangkat ke slot 12% (bebas tumpang tindih judul).
  S1: tirai dua panel (z-30) + pengantar (z-40), curtain open/close gsap
  power4.inOut, iframe YouTube E6pPlIvlrPs autoplay, iframe focus reclaimer.
  S2: statement 3.4vw + 3 fakta clip-path reveal. S3: 3 definisi eksklusif
  (KBBI/Wulandari/Samal&Ardianto) + 5 karakteristik baris kumulatif.
- Task 5 — S4 Anatomy Theater: split-screen 45/55. Kiri lembar rontgen A4
  (1:√2) dengan 3 zone (prelim/body/postlim) + 5 segmen BAB + scanline + tanda
  pojok. Zone terpilih menyala (border zona: ember/paper/gold), lainnya
  tergeser & 20% opacity. Drill A–E: segmen BAB flexGrow 2.4 + sub-bar terbuka.
  Kanan: panel clip-path expand per rongga + detail BAB inline.
- Task 6 — S5 Polling: intro typewriter, QR (img src di-set via DOM effect
  [qid] — bug fixed), fetch /api/results tiap 3s, bar CSS .pollbar, threshold
  15s <10 responden → notice fallback, F fallback (klik opsi → reveal), R reset.
  VotingPage #/voting: mobile-first (tombol 66-78px), POST /api/vote, localStorage
  flag anti double-submit, Q2 terbuka setelah Q1, error inline + retry.
- Task 7 — S6 Battle Cards: 4 kartu absolut (w-20vw) dikoreografi gsap
  (grid/spotlight 1.42x/compare 0.86x), B toggle komparasi dengan hot-row
  amber. S7: 3 poin eksklusif + panel sebelum (merah redup) vs sesudah (amber).
  S8: 4 simpulan → callback "sudah" amber → kredit; kata ambient mengapung.
- Task 8 — page.tsx: hash router #/voting via useSyncExternalStore (lolos
  react-hooks/set-state-in-effect). Lint: 0 error.
- Task 9 — QA agent-browser: golden path penuh (opening→video→…→kredit),
  G5 jump, ArrowLeft instant-settle, voting end-to-end (klik→TERCATAT→bar 100%),
  R reset→0, F fallback→klik→reveal, B komparasi, C contrast class, M mute HUD.
  Diperbaiki: (a) S0 import salah useIsoLayoutEffect dari "react" (penyebab
  500 — root cause), (b) SSR react-ssr tidak ekspor useLayoutEffect → semua
  effect pakai useEffect + CSS initial hidden, (c) QR effect deps [qid],
  (d) tumpang tindih S0, (e) seam tirai memotong teks. VLM review screenshot:
  voting mobile & opening = bersih. Viewport 375px: tombol 78px, font 19px.

Stage Summary:
- Presentasi lengkap 9 babak berjalan di / (HTTP 200, lint 0 error, polling
  API 200). Voting di #/voting terverifikasi end-to-end.
- Shortcut aktif: Space/→/←, G+0-8, 1/2/3, A-E, B, C, M, F, R, Shift+S.
- Dev server jalan di background port 3000 (jangan di-restart manual).
- State demo bersih: votes sudah di-reset.
- Risiko kecil: autoplay YouTube tergantung kebijakan browser (klik play bila
  perlu — fokus keyboard otomatis dikembalikan).
