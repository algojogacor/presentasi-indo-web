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

---
Task ID: 10
Agent: main (Z.ai Code)
Task: QA penuh via agent-browser + perbaikan bug visual + fitur presenter (jam, peta navigasi, persistensi posisi) + polish styling + voting live feedback

Work Log:
- QA agent-browser (golden path ACT.00→08, G-jump, B komparasi 5 hot-rows,
  voting end-to-end, R reset) → SEMUA LOLOS; dev server & log bersih.
- VLM review 8 screenshot (2 batch) → 3 temuan nyata:
  (a) S2 label "FAKTA 03 — KONSEKUENSI" wrap dua baris, (b) wireframe rontgen
  S4 terlalu redup untuk proyektor, (c) risiko tabrakan label TERCATAT di HP.
- Fix S2: kolom tag 13vw→15vw + whitespace-nowrap + tracking 0.18em.
- Fix S4: seluruh garis wireframe white/12→white/16-28, border blok
  white/10→white/14-20, z-label overview 0.6→0.75 opacity.
- FITUR BARU — session.ts (store modul + useSyncExternalStore):
  posisi (kti-pos) + jam (kti-clock) di sessionStorage; bertahan lintas
  reload DAN lintas pergantian rute presentasi↔voting; visitedActs (Set modul,
  aman dibaca saat render — lolos react-hooks/refs).
- FITUR BARU — Jam presenter: HUD kiri-bawah "T+MM:SS / 60:00", mulai saat
  navigasi pertama melewati gerbang, ≥50 menit → amber; jam tetap berjalan
  setelah refresh tak sengaja.
- FITUR BARU — Peta navigasi [O]/[Tab]: overlay "DAFTAR ISI — Peta babak"
  (MapOverlay.tsx), 9 baris klik-untuk-lompat, angka langsung lompat saat
  terbuka, [Esc] tutup, HUD menunjukkan "// PETA", tombol lain di-telan
  saat peta terbuka.
- FITUR BARU — Persistensi posisi: refresh di tengah → gerbang S0 menampilkan
  "POSISI TERSIMPAN — [L] LANJUT ACT.XX // STEP.YY"; [L] = resume settle instan
  tanpa replay animasi (visitedActs ditandai sebelum goto).
- FITUR BARU — HUD cheat line [H] toggle + rel 9 tick babak kanan-bawah
  (aktif = amber, pernah dilihat = paper/30, belum = white/12).
- FITUR BARU — S5 polling: persentase "count · pct%" per baris, total
  responden flash amber saat berubah (count-flash), QR dengan bracket sudut
  amber (bingkai bidik).
- FITUR BARU — Voting: total suara kelas live (poll 4s) setelah menjawab,
  kartu penyelesaian "Dua jawaban. Terekam." saat Q1+Q2 terekam,
  focus-visible:border-ember + label flex-1/shrink-0 (anti tabrakan).
- STYLING — vignette sinematik radial (z-55, mati saat contrast-boost),
  reduced-motion untuk count-flash.
- Refactor lint-driven: seenRef→visitedActs (module Set) + savedPos/clock via
  useSyncExternalStore → 0 error react-hooks/refs & set-state-in-effect.
- QA ulang agent-browser: gate bersih sesi baru, jam hidup (T+00:05), peta
  buka/tutup/klik-lompat/angka/Esc, reload→gerbang [L]→resume instan ACT.08,
  H toggle, polling persentase (1·25%, 3·75%), 4 bracket QR, voting Q1+Q2 →
  kartu penyelesaian + 2 live total. VLM ulang: map "sangat rapi", 3 micro-fix
  diterapkan (cheat-line /30, bracket 4px, TERCATAT shrink-0).
- Demo state di-reset (votes kosong, localStorage/sessionStorage bersih).

Stage Summary:
- Status: STABIL + diperkaya. Lint 0 error (1 warning font pre-existing).
- Shortcut penuh: Space/→/←, G+0-8, 1/2/3 (S4), A-E (S4), 1-4+B (S6),
  C kontras, M bisu, F fallback, R reset, Shift+S skip video,
  [O]/[Tab] peta, [L] resume, [H] bantuan.
- Arsitektur baru: src/components/presentation/session.ts (store modul) —
  pola konsumsi: useSyncExternalStore(subscribeSession, getSnapshot, server).
  Kunci: kti-pos, kti-clock di sessionStorage.
- Risiko kecil tersisa: autoplay YouTube tergantung kebijakan browser;
  getElapsedSeconds berbasis Date.now() (aman, granularitas detik).
- Prioritas next: (opsional) hit counter responden real-time via WebSocket
  mini-service, mode rehearsal (auto-advance timer), export hasil polling CSV.

---
Task ID: 11
Agent: main (Z.ai Code)
Task: QA stabil + fitur real-time WebSocket (mini-service live-notify) + kartu babak sinematik + polish gerbang S0

Work Log:
- QA awal: opening, polling, S2 tag (semuanya 15px = satu baris), voting, lint — stabil.
- FITUR INTI — notifikasi suara real-time via socket.io:
  - mini-services/live-notify/ (proyek bun mandiri, port 3030, `bun --hot`):
    server socket.io path "/" (wajib untuk Caddy). Klien terpercaya (auth.role
    "presenter-server") dari backend Next.js memancarkan notify:vote /
    notify:reset → di-broadcast ke semua klien (vote:new / votes:reset).
  - CATATAN ARSITEKTUR: HTTP POST /notify di mini-service TIDAK mungkin —
    engine.io dengan path "/" mencegat SEMUA request (uji: "Transport
    unknown"). Solusi: backend terhubung sebagai klien socket.io terpercaya.
  - src/lib/notify.ts — singleton socket.io-client server-side ke
    localhost:3030 (server-to-server, tanpa gateway), fire-and-forget,
    reconnect otomatis, kegagalan ditelan.
  - src/instrumentation.ts — prewarm tautan saat server Next menyala.
  - /api/vote: setelah insert → count → notifyVote(question, total).
  - /api/reset: setelah deleteMany → notifyReset().
  - S5Polling: loadResults (useCallback bersama) + polling HTTP 3s (fallback
    tetap) + socket io("/?XTransformPort=3030") → vote:new = refresh instan,
    votes:reset = zeroing instan; indikator "· SYNC" saat tersambung;
    "MENUNGGU SUARA PERTAMA…" saat live & total 0.
  - VotingPage: live total via socket (instan) + polling 8s fallback.
- QA real-time VIA GATEWAY (:81 — penting: localhost:3000 langsung TIDAK
  melalui Caddy sehingga XTransformPort tidak diforward):
  - handshake engine.io melalui gateway OK; SYNC menyala; vote via API →
    presenter 0→1 dalam 800ms (< polling 3s = bukti instan); 5 suara → bar
    A·20% C·60% D·20% instan; reset broadcast → 0 + MENUNGGU kembali;
    voting page → "1 SUARA MASUK" instan.
- FITUR — kartu babak (ActCard.tsx): flash judul saat memasuki babak baru
  (numeral romawi I–VIII / "OUVERTURE" + label, Cormorant 11vw paper/12,
  label ember letterSpacing animasi); GSAP timeline ~1.9s, terdaftar sebagai
  timeline aktif → [SPACE] memotong; tidak muncul saat kembali ke babak yang
  pernah dilihat (settled).
- FITUR — HUD: STEP.XX/YY (total langkah per babak, mis. STEP.01/04).
- STYLING — gerbang S0: 4 bracket sudut amber bernafas (gate-bracket,
  2.8s), garis pemudar (gradient rule), cahaya panggung radial amber 0.06
  dari atas, tombol hover:text-ember; reduced-motion diperbarui.
- Lint: 0 error (1 warning font pre-existing). Dev log bersih.
- Keanehan dev-mode (dihadapi): modul notify.ts ter-instantiate dua kali
  saat hot-reload → dua koneksi "SERVER" — broadcast duplikat idempoten
  (klien re-fetch angka sama); produksi/prewarm = satu koneksi.

Stage Summary:
- Status: STABIL + real-time penuh. Arsitektur polling kini dua jalur:
  socket instan (primary) + HTTP 3s (fallback) — layar presenter, halaman
  voting, dan backend semuanya tersinkron.
- Komponen/file baru: mini-services/live-notify/{package.json,index.ts},
  src/lib/notify.ts, src/instrumentation.ts, ActCard.tsx.
- QA wajib lewat http://localhost:81/ (gateway) — bukan :3000 — untuk
  menguji XTransformPort socket.
- Shortcut lengkap tidak berubah (lihat Task 10) + perilaku baru: [SPACE]
  memotong kartu babak saat flash berjalan.
- Risiko: koneksi pertama vote (lazy) mungkin terlewat → polling menutup;
  produksi prewarm menutup celah. YouTube autoplay tetap kebijakan browser.
- Prioritas next: (opsional) ekspor hasil polling CSV untuk laporan,
  mode rehearsal auto-advance, indikator jumlah perangkat tersambung di S5.

---
Task ID: 12
Agent: main (Z.ai Code)
Task: QA stabil + tiga fitur baru (ekspor CSV, presence perangkat, klimaks reveal) + polish styling

Work Log:
- Baca worklog: Task 10–11 sudah selesai (clock, peta, persistensi, real-time
  socket, ActCard). Verifikasi awal: dev log bersih, lint 0 error, live-notify
  handshake OK, gateway :81 OK.
- QA regresi via agent-browser (lewat gateway :81): gerbang → Space → HUD
  T+MM:SS aktif → G+5 → S5 live (5 RESPONDEN, SYNC, EKSPOR hint) → vote via
  API → presenter refresh instan → voting page TERCATAT + live total + Q2
  unlock. SEMUA LOLOS → lanjut pengembangan fitur baru.
- FITUR A — Ekspor CSV: src/app/api/export/route.ts (GET). Blok RINGKASAN
  per pertanyaan (opsi, jumlah, persentase, kunci BENAR, total, "BENAR: X%")
  + blok DETAIL kronologis. UTF-8 BOM (Excel-safe), koma pemisah, sel
  di-escape kutip ganda, nama file `polling-kelompok6-YYYY-MM-DD.csv`.
  Shortcut presenter [E] di S5 (a elemen klik → unduh + HUD transient).
  Diverifikasi curl: headers + isi CSV benar untuk 5 suara (D 60% mayoritas,
  B benar 20%).
- FITUR B — Presence perangkat: mini-services/live-notify/index.ts menandai
  socket.data.trusted, hitung audienceCount() (non-trusted), broadcast
  "presence" {count} saat connect/disconnect + emit awal ke socket baru.
  S5Polling: sock.on("presence") → badge "· N PERANGKAT" (live, >0).
  VotingPage: socket level-halaman → header "· N TERHUBUNG" + QuestionCard
  (done) "· N TERHUBUNG" setelah "X SUARA MASUK". CATATAN PENTING: hot-reload
  bun --hot TIDAK menggantikan modul lama (log format lama) → mini-service
  harus di-restart manual (kill PID bun --hot + nohup ulang). Setelah
  restart, presence live terverifikasi (4→6 perangkat saat halaman berganti).
- FITUR C — Klimaks reveal di S5: hitung saat render (ikut gerak bila suara
  masuk setelah reveal): maxCount, winners (boleh seri), correctCount/Pct.
  Opsi: tag "JAWABAN · MAYORITAS" / "JAWABAN" / "MAYORITAS KELAS" (paper
  style bila mayoritas salah); bar winner = .pollbar-winner (gradasi emas +
  denyut pollWinnerPulse), kunci tanpa mayoritas = .pollbar-correct (ember +
  glow statis). Statistik besar: angka "NN%" Cormorant 4vw ember +
  "KELAS MENJAWAB BENAR · X/Y SUARA" + verdict italik 4 tingkat
  (≥80% "sejalan", ≥50% "di jalur", >0% "minoritas yang benar", 0%
  "momen bedah paling bagus"). QA dua skenario: mayoritas salah
  (20% / D tag / verdict minoritas) DAN mayoritas benar
  ("JAWABAN · MAYORITAS" / 75% / 3/4 / verdict "di jalur").
- STYLING — globals.css: .pollbar-winner, .pollbar-correct, .reveal-stat
  (keyframes revealStat) + ketiganya masuk prefers-reduced-motion.
  S5 menambah baris hint mini "[F] FALLBACK · [R] RESET · [E] EKSPOR CSV"
  di bawah bar hasil.
- VLM review screenshot reveal: "No critical layout issues found. The design
  is ready for presentation." (nitpick: angka latar 05 sangat redup — sudah
  disengaja; wrap teks opsi D tetap terbaca).
- Lint akhir: 0 error (1 warning font pre-existing). Demo state di-reset
  (votes kosong, storage bersih). Screenshot arsip:
  download/qa-s5-reveal.png, qa-s5-reveal-majority-correct.png,
  qa-voting-done.png.

Stage Summary:
- Status: STABIL + 3 fitur baru terverifikasi end-to-end (semua QA lewat
  gateway :81 karena XTransformPort socket).
- Endpoint baru: GET /api/export (CSV attachment, BOM, ringkasan + detail).
- Event socket baru: "presence" {count} — dikonsumsi presenter S5 + voting
  (header + kartu selesai). audienceCount mengecualikan koneksi trusted
  (presenter-server).
- S5 klimaks reveal: winner glow + statistik %benar + verdict naratif —
  dua skenario QA lolos; presenter clock/peta/persistensi tetap sehat.
- Risiko/keanehan: (a) hot-reload mini-service tidak menggantikan modul —
  WAJIB restart manual bila mengubah index.ts; (b) dev-mode notify.ts dua
  koneksi SERVER (pre-existing, broadcast idempoten); (c) angka presence di
  dev bisa menghitung socket sisa navigasi (produksi normal); (d) autoplay
  YouTube tetap kebijakan browser.
- Prioritas next: (opsional) mode rehearsal auto-advance per langkah dengan
  durasi target per babak; grafik tren suara masuk per detik di S5;
  halaman arsip hasil (tabel semua pertanyaan + tautan CSV) untuk laporan.

---
Task ID: 13
Agent: main (Z.ai Code)
Task: QA stabil + tiga fitur baru (mode rehearsal, kurva tempo suara, halaman arsip hasil) + polish styling + perbaikan robustness G+digit

Work Log:
- Baca worklog (Task 0–12 selesai) + verifikasi awal: lint 0 error, dev :3000
  dan mini-service live-notify :3030 hidup, log bersih.
- QA regresi via agent-browser (gateway :81): gerbang → Space → HUD jam
  T+MM:SS hidup → G+5 → S5 (SYNC, 5 PERANGKAT, EKSPOR hint) → vote via API
  → presenter refresh instan → voting page TERCATAT + Q2 unlock + kartu
  selesai → reload → [L] resume ACT.05. SEMUA LOLOS.
- TEMUAN QA (bukan bug produksi, tapi perbaikan): dua keydown "g"+"digit"
  dalam satu tick JS tidak melompat (closure React gArmed belum ter-flush).
  FIX: gArmed dipindah ke gArmedRef (dibaca sinkron di handler) + gShow
  state kosmetik untuk HUD — diverifikasi dispatch back-to-back kini LOLOS.
- FITUR A — Mode Rehearsal [T]:
  - rehearsal.ts (baru): REHEARSAL_PLAN per-langkah per-babak, total 3180 dtk
    (± 53 menit + cadang tanya-jawab); stepDuration, plannedElapsed, fmtDelta,
    cumStepsBefore, TOTAL_STEPS, PLAN_TOTAL.
  - session.ts: state rehearsal di store eksternal (getRehearsalOn,
    getRemainingSeconds, setRehearsal, armStep, deferDeadline) — runtime saja,
    tidak ke sessionStorage; patuh lint react-hooks/refs & set-state-in-effect.
  - Experience.tsx: [T] toggle (HUD transient), auto-advance 1 dtk/detak via
    advanceRef (interval bebas stale closure), tenggat ditunda saat peta
    terbuka / timeline GSAP aktif (tidak memotong animasi), gerbang dikecualikan
    (jam belum jalan), armStep dipasang di efek persistensi [section,step],
    cadangan 9999 dtk bila advance mentok di ACT.08 akhir (anti spam HUD).
  - HUD baru: "REHEARSAL · AUTO NNS" (amber ≤10 dtk) + "RENCANA ±MM:SS ·
    TERLAMBAT/LEBIH CEPAT/SESUAI JADWAL" (delta = elapsed − plannedElapsed).
  - QA: T on/off, AUTO 179S→167S menurun, G+1 → AUTO 14S terpasang ulang,
    auto-advance benar-benar menembak (STEP.00→01 ACT.01 setelah ±15 dtk,
    re-arm 635S untuk langkah video), delta TERLAMBAT/LEBIH CEPAT benar
    arahnya di dua posisi berbeda.
- FITUR B — Kurva tempo suara (S5):
  - /api/timeline?question=1|2 (baru): kurva kumulatif kedatangan suara
    (bucket adaptif, maks ±120 titik) — kontrak /api/results tak tersentuh;
    question=3 → 400 (terverifikasi curl).
  - S5Polling: fetchTimeline + scheduleSpark (debounce 1,4 dtk), pemicu
    awal [live,qid] + socket vote:new, votes:reset → spark=null; render SVG
    polyline + area amber (draw-in .spark-curve) + kaption "TEMPO SUARA ·
    N DALAM M:SS", hanya saat live & !fallback & total>0.
  - QA: seed 7 suara berjarak waktu → kurva hidup (7 DALAM 0:13), VLM: terlihat
    & terbaca, tak bertabrakan dengan QR / hint [F].
- FITUR C — Halaman arsip hasil #/results (baru, src/components/results/):
  - Tabel visual per pertanyaan: bar + count·pct + tag (JAWABAN·MAYORITAS /
    JAWABAN / MAYORITAS KELAS), statistik %benar + verdict + pembahasan —
    identik logika S5.
  - Real-time penuh (socket vote:new/votes:reset/presence + fallback HTTP
    10 dtk), header "N SUARA TOTAL · SYNC · N PERANGKAT · DIPERBARUI HH:MM:SS",
  empty state "Belum ada suara…".
  - Footer sticky (mt-auto): UNDUH CSV (/api/export), CETAK/PDF (window.print),
    tautan #/ presentasi & #/voting — semua no-print + focus-visible ember.
  - page.tsx: rute hash #/results (routeFromHash startsWith), body overflow
    auto + scrollTo(0,0).
  - Print stylesheet (@media print di globals.css): latar putih, teks hitam,
    tombol disembunyikan, bar amber solid, rcard anti page-break — diverifikasi
    via agent-browser pdf + pdftoppm + VLM (4/4 lolos).
  - QA: desktop + viewport 375×720 (VLM: bersih), vote via API → 7→8 SUARA
    TOTAL instan (socket), reset → empty state.
- STYLING — pita progres tepi-bawah (3px, z-68, hanya setelah gerbang): track
  white/7 + tick batas babak + fill amber/65 (.ribbon-fill transition 1,1s) +
  penanda rencana belah ketupat amber (.plan-dot pulse) hanya saat rehearsal —
  presenter melihat posisi aktual vs rencana secara visual. Hover glow kartu
  battle S6 (.battle-card — transition border/box-shadow saja, transform &
  opacity tetap milik GSAP). Reduced-motion diperbarui (plan-dot, spark-curve,
  ribbon-fill) + blok print.
- Lint akhir: 0 error (1 warning font pre-existing). Catatan dev.log: error
  "gArmed is not defined" HANYA transient saat MultiEdit berjalan (hot-reload
  antar-edit) — log terkini bersih, semua fungsional terverifikasi setelahnya.
- Demo state di-reset: votes kosong, localStorage/sessionStorage bersih.
  Screenshot arsip: download/qa13-rehearsal-ribbon.png, qa13-results-desktop.png,
  qa13-results-mobile.png, qa13-s5-sparkline.png, qa13-results-print.pdf.

Stage Summary:
- Status: STABIL + 3 fitur baru terverifikasi end-to-end (rehearsal, kurva
  tempo, arsip hasil) + 1 perbaikan robustness (G+digit same-tick).
- Shortcut penuh sekarang: Space/→/←, G+0-8, 1/2/3 (S4), A-E (S4), 1-4+B (S6),
  C, M, F, R, E, Shift+S, [O]/[Tab] peta, [L] resume, [H] bantuan, [T] BARU
  mode rehearsal.
- File baru: rehearsal.ts, src/app/api/timeline/route.ts,
  src/components/results/ResultsPage.tsx. Edit: session.ts, Experience.tsx,
  S5Polling.tsx, page.tsx, globals.css.
- Arsitektur: state rehearsal di store eksternal session.ts (deadline epoch-ms,
  bukan state React) — auto-advance bebas stale closure & lint-clean.
- Rencana latihan 53 menit (REHEARSAL_PLAN) — presenter bisa latihan sendiri
  dengan auto-advance + patokan waktu + pita progres vs rencana.
- Arsip laporan: #/results (live + cetak/PDF + CSV) — pasca-presentasi angka
  polling siap dilampirkan ke laporan kelompok.
- Risiko/keanehan: (a) auto-advance rehearsal memotong nada S0 jika durasi
  habis tepat saat timeline berjalan — mitigasi deferDeadline saat tl aktif;
  (b) presence di dev bisa menghitung socket sisa navigasi (pre-existing);
  (c) autoplay YouTube tetap kebijakan browser; (d) hot-reload mini-service
  tidak menggantikan modul (pre-existing — restart manual bila mengubah
  index.ts mini-service).
- Prioritas next (opsional): mode "papan skor" untuk kuis tambahan;
  ekspor PDF otomatis pasca-sesi; preset urutan G (playlist latihan);
  grafik agregat per-babak untuk analisis temporal.

---
Task ID: 14
Agent: main (Z.ai Code)
Task: QA stabil + tiga fitur (lembar bantuan [?], statistik hidup S8, tombol bagikan voting) + sapuan garis pergantian babak + perbaikan bug import

Work Log:
- Baca worklog (Task 13 selesai) + verifikasi awal: lint 0 error, :3000/:3030
  hidup, log bersih. QA smoke: gerbang → Space → S4 drill penuh (zone/BAB/
  postliminaries tampil benar) → S8 → kredit. SEMUA LOLOS.
- QA menemukan SATU BUG RUNTIME (client-side exception di S8 step 5):
  root cause — refactor import S8Closing melupakan `useRef` (dipakai komponen
  utama) → "ReferenceError: useRef is not defined". Ditangkap dengan error
  listener window + reproduksi; FIX: kembalikan useRef ke import.
- FITUR A — Lembar bantuan presenter [?] / [F1] (HelpOverlay.tsx, baru):
  dialog modal 4 kelompok pintas (NAVIGASI / SESI & WAKTU / BABAK TERPILIH /
  TAMPILAN), 17 baris kunci+deskripsi, grid 2 kolom → 1 kolom di ≤720px,
  tombol [ESC] TUTUP (focus-visible ember). HUD "// BANTUAN" saat terbuka,
  baris cheat-line kini menyebut [?] BANTUAN. Tombol lain DITELAN saat
  terbuka (g+5 diverifikasi tak melompat), [Esc]/[?] menutup, G+6 jalan
  lagi setelah tutup. Typo "BERJalan" ditemukan via QA → diperbaiki.
- FITUR B — Statistik hidup layar tanya jawab S8 (QaStats di S8Closing):
  baris tengah "SESI T+MM:SS · N SUARA TEREKAM · N PERANGKAT TERHUBUNG" +
  hint "ARSIP LENGKAP → /#/RESULTS". Sumber: session store (jam),
  /api/results Q1+Q2 (useCallback load — fallback HTTP 5 dtk), socket
  presence + vote:new/votes:reset (instan). QA: 5 suara seed → tampil
  "T+05:31 · 5 SUARA TEREKAM · 5 PERANGKAT".
- FITUR C — Tombol BAGIKAN KE TEMAN di kartu penyelesaian voting
  (VotingPage ShareButton): Web Share API (title/text/url), fallback
  clipboard + umpan balik "TAUTAN DISALIN" 2,2 dtk. QA: stub clipboard →
  teks benar (origin/#/voting), tombol muncul hanya setelah Q1+Q2.
- STYLING — sapuan garis pergantian babak (act-wipe): garis amber 1px
  gradasi (top 38%, lebar 84vw, z-56) menyapu kiri→kanan via GSAP timeline
  (scaleX 0→1 power2.inOut 0,42 dtk → fade) SETIAP masuk babak baru
  (bukan settle/kembali, bukan ACT.00); contrast-boost versi lebih pekat.
  QA computed style mid-anim: opacity 1, scaleX 0.94 → opacity 0 setelahnya.
- VLM review 4 screenshot → temuan nyata SATU: QaStats (bottom 9vh) terlalu
  dekat dengan blok HUD kiri-bawah → terlihat bertumpukan. FIX: naik ke
  bottom-[13vh] + lebar w-[64vw] max-w-820px + hint dipendekkan. VLM
  verifikasi ulang: "No, none of the text elements physically overlap".
  Temuan lain (logo "N", kutipan "Anonim") = halusinasi VLM — diverifikasi
  tidak ada di kode/screenshot.
- Regresi akhir: gerbang bersih (0 posisi tersimpan), G+5, [?] buka/tutup,
  [T] on/off, voting 2 jawaban + share, reset. Lint 0 error (1 warning font
  pre-existing), dev log 0 error.
- Demo state di-reset (votes kosong, storage bersih). Screenshot arsip:
  download/qa14-{s4-drill, s8-closing, s8-closing-v2, help-overlay,
  voting-share, s8-qa-stats}.png.

Stage Summary:
- Status: STABIL + 3 fitur baru + 1 styling sinematik + 1 bug fix.
- Shortcut penuh sekarang: Space/→/←, G+0-8, 1/2/3, A-E, 1-4+B, C, M, F, R,
  E, Shift+S, [O]/[Tab] peta, [L] resume, [H] cheat-line, [T] rehearsal,
  [?]/[F1] BARU lembar bantuan lengkap.
- File baru: HelpOverlay.tsx. Edit: Experience.tsx (helpSheet state +
  handler + render + wipe), S8Closing.tsx (QaStats + import fix),
  VotingPage.tsx (ShareButton), globals.css (.act-wipe, .help-grid
  responsive, typo-fix coverage).
- Pola QA penting yang terbukti: error listener window sebelum aksi
  menangkap ReferenceError yang tak terlihat di dev.log (client-side).
- Risiko/keanehan: (a) autoplay YouTube kebijakan browser (pre-existing);
  (b) presence dev-mode bisa menghitung socket sisa (pre-existing);
  (c) navigator.share di desktop Chrome umumnya undefined → fallback
  clipboard selalu siap; (d) hot-reload mini-service tak menggantikan modul
  (pre-existing).
- Prioritas next (opsional): preset "playlist" latihan per-babak (rehearsal
  hanya untuk babak tertentu), mode kuis tambahan papan skor, ekspor PDF
  otomatis arsip, grafik agregat per-babak.

---
Task ID: 15
Agent: main (Z.ai Code)
Task: QA verifikasi fix S4 + dua mandat wajib — polish styling sinematik & fitur catatan presenter [N]

Work Log:
- Baca worklog (Task 14 selesai, status STABIL). Verifikasi warisan sesi sebelumnya:
  edit kontras S4Anatomy tersimpan (15 okurensi nilai baru), lint 0 error,
  dev server hidup (:3000 HTTP 200, log bersih). PENTING: seluruh QA sesi ini
  memakai viewport 1920×1080 (lihat temuan di bawah).
- QA BASELINE S4 (agent-browser + VLM): screenshot baseline + drill 4 langkah.
  VLM 1080p: label panel kiri "Good", kontras tengah "Strong", overlap/wrap
  "None observed" → fix kontras S4 sesi lalu TERVERIFIKASI.
- FITUR — Panel Catatan Presenter [N] (baru, non-modal):
  - `src/lib/notes.ts` — NOTE_PLAN 46 langkah (9 babak): judul langkah + cue
    penyampaian ringkas (pola bicara, momen jeda, jembatan antar-babak).
  - `NotesPanel.tsx` — panel kanan-bawah: header CATATAN · ACT.XX STEP.YY +
    RENCANA durasi (dari REHEARSAL_PLAN), judul+cue langkah aktif, konteks
    ←sebelum/→sesudah, tombol tutup [×] (satu-satunya elemen klik-able).
  - Keyboard: [N] toggle; [Esc] tutup; NON-MODAL — Space/G+jump tetap hidup,
    konten panel mengikuti navigasi langsung; disembunyikan saat help/peta
    terbuka. HUD "// CATATAN" + lamp NOTE; cheat-line + HelpOverlay diperbarui
    (baris [N] di grup TAMPILAN).
  - QA: buka di gerbang → ikut ke ACT.04 STEP.00 ("Peta tubuh — overview"),
    Esc + [×] bekerja, 0 runtime error, VLM 1080p: "No overlap, professional,
    intentional UI element" (overlap-count programatik = 0).
- STYLING — polish "cinema chrome":
  - Pita progres: segmen babak selang-seling (tint white/5), batas babak lebih
    terang (white/25), isian gradasi ember (ember/40→ember) + TITIK UJUNG
    MENYALA (.ribbon-tip — 7px glow amber, transisi linear 1.1s).
  - HUD presenter: hairline vertikal kiri (border-edge/70) + LAMPU STATUS
    (.hud-lamp cip ember: C+ / MUTE / NOTE) menggantikan teks status polos.
  - Rel babak kanan: tick aktif + .rail-live (box-shadow glow amber).
  - MapOverlay: durasi rencana per babak ("N LANGKAH · M′") + rail mini tick
    per langkah (aktif 9px ember, dilihat 6px paper, belum 6px white/12).
  - prefers-reduced-motion: ribbon-tip ikut dimatikan.
- QA REGRESI PENUH (semua LOLOS, 0 error runtime):
  - Peta [O]: 9 baris, 9 grup tick, 9 label durasi. Esc menutup.
  - Lampu HUD: [M]→MUTE, [C]→C+, toggle balik bersih.
  - HelpSheet [?]: baris [N] tampil; [Esc] tutup.
  - Voting #/voting (viewport 375): Q1 B + Q2 C → 2× TERCATAT + BAGIKAN KE
    TEMAN + footer; catatan skrip: tombol 0–3 = Q1, 4–7 = Q2.
  - Arsip #/results: 14 SUARA TOTAL, kartu per pertanyaan, UNDUH CSV.
  - S5 presenter: seed 12 suara → live "12 RESPONDEN", bar B 58%, reveal 58%
    + verdict + MENGAPA; VLM 1080p PASS 5/5 kriteria.
  - Golden path: gerbang → kredit → video → Shift+S → S2 (FAKTA 01 tampil),
    G+8 → S8. (Catatan: Shift+S hanya bekerja di section 1 — butuh 2× Space
    dari gerbang; bukan bug.)
- Temuan PENTING utk QA mendatang: viewport default agent-browser adalah
  375×720 — Screenshot awal sesi ini (S4 baseline/zones versi kecil) menipu
  VLM ("overlap", "kontras buruk") padahal layout dirancang utk 1920×1080.
  SELALU jalankan `agent-browser set viewport 1920 1080` sebelum QA presentasi.
- Lint final: 0 error (1 warning font pre-existing). Demo state di-reset
  (votes kosong, localStorage bersih). Screenshot arsip: download/qa15-*
  (s4-baseline, s4-zones, notes-panel, notes-1080p, s4-zones-1080p, map-1080p,
  s5-live-1080p, s5-reveal-1080p, voting-done, results).

Stage Summary:
- Status: STABIL + 1 fitur presenter baru + polish styling menyeluruh.
- Shortcut penuh kini: Space/→/←, G+0-8, 1/2/3, A-E, 1-4+B, C, M, F, R, E,
  Shift+S, [O]/[Tab] peta, [L] resume, [H] cheat-line, [T] rehearsal,
  [?]/[F1] bantuan, [N] BARU catatan presenter.
- File baru: src/lib/notes.ts, NotesPanel.tsx. Edit: Experience.tsx (state
  notesOpen + handler + render + ribbon/lamp/rail + cheat-line), MapOverlay.tsx
  (durasi + micro-ticks), HelpOverlay.tsx (baris [N]), globals.css
  (.ribbon-tip, .hud-lamp, .rail-live, .notes-panel/.notes-close + reduced-motion).
- Risiko/keanehan: (a) VLM rawan halusinasi orientasi/konten — selalu
  konfirmasi lewat eval programatik + dimensi file screenshot; (b) viewport
  default browser QA sempit (lihat catatan); (c) autoplay YouTube kebijakan
  browser & presence dev-mode (pre-existing); (d) notes panel sengaja
  non-modal — presenter bertanggung jawab menutup sebelum Q&A.
- Prioritas next (opsional): (1) mode "papan skor" kuis tambahan; (2) preset
  playlist latihan per-babak; (3) ekspor PDF arsip otomatis; (4) grafik
  agregat per-babak di arsip; (5) catatan [N] kaya — estimasi "sisa waktu
  bicara" berdasarkan tempo aktual.

---
Task ID: 16
Agent: main (Z.ai Code)
Task: QA baseline + tiga fitur baru dari prioritas handover — papan skor [P], strip tempo catatan, ringkasan arsip

Work Log:
- Baca worklog (Task 15 STABIL). Baseline QA 1080p: dev server hidup, gerbang →
  kredit → G+6 S6 → S5 live→reveal→verdict (seed 14 suara Q1), voting API,
  arsip #/results, peta [O], catatan [N] — semua LOLOS, 0 error runtime.
- FITUR 1 — PAPAN SKOR [P] (prioritas #1 handover, S5 reveal):
  - `S5Polling.tsx`: state `scoreFor {qid, step}` (konteks pembukaan, bukan
    boolean — kedaluwarsa otomatis saat meninggalkan reveal TANPA useEffect;
    pola derivatif demi react-hooks/set-state-in-effect).
  - Tampilan peringkat: baris 01–04 terurun suara; numeral peringkat besar
    (01 ember 3vw, lainnya paper/30 2.1vw); bar diskalakan ke pemimpin
    (rel = c/maxCount, bukan persen total); tag KUNCI/MAYORITAS; veredik
    ketepatan kelas besar + [P] kembali.
  - Tombol [P]: reveal+suara>0 → buka/tutup; live → HUD "TERSEDIA SAAT
    PEMBAHASAN"; total 0 → HUD "MENUNGGU SUARA". [R] reset saat terbuka →
    auto-tutup (total→0). Baris bawah S5 + HelpSheet + hint reveal diperbarui.
- FITUR 2 — STRIP TEMPO CATATAN [N] (prioritas #5 handover):
  - `NotesPanel.tsx`: useSyncExternalStore jam sesi (detak 1s dari
    subscribeSession) + plannedElapsed → baris "T+MM:SS · JADWAL ±MM:SS ·
    SISA MM′"; ember saat terlambat >60 dtk, redup saat lebih cepat >45 dtk.
  - Verifikasi live: T+24:51 → 24:54 (tick hidup), JADWAL −13:57 benar
    (loncat G+5), SISA 14′ cocok rencana 53′.
- FITUR 3 — RINGKASAN KELAS di arsip #/results (prioritas #4 handover):
  - `ResultsPage.tsx`: fetch /api/timeline per pertanyaan (tambahan di load(),
    gagal → diam); dua kartu agregat: % ketepatan besar, pemenang/seri,
    kurva tempo sparkline (kelas .spark-curve dipakai ulang); header silang
    "Q1 N SUARA · Q2 N SUARA · RETENSI %" (min/max total).
- STYLING (globals.css): .score-row (stagger 90ms via animation-delay),
  .score-bar (transisi 0.8s — peringkat bisa bergeser hidup saat suara
  telat masuk), .score-bar-first (gradasi emas + glow, versi contrast-boost),
  .agg-card (break-inside avoid); print: .agg-card border #999, spark-curve
  tanpa animasi; prefers-reduced-motion: score-row/score-bar ikut mati.
- QA REGRESI PENUH (semua LOLOS):
  - Scoreboard Q1: peringkat B(11)→A/C/D(1), KUNCI + 79% · 11/14; Q2:
    B(8)→A(1)→D(1)→C(0), 80% · 8/10; toggle [P] buka/tutup bersih; [P] di
    live → HUD benar; [R] saat terbuka → auto-tutup; VLM 1080p 3/3 PASS
    (tanpa overlap, rank-1 dominan, bar proporsional 8:1:1:0).
  - Golden path: gerbang → kredit → S1 video → Shift+S → S2; peta [O];
    lampu HUD [C]/[M]; HelpSheet baris [P] tampil; hint "[P] PAPAN SKOR"
    muncul hanya di langkah reveal.
  - Arsip: RINGKASAN 2 kartu + RETENSI 71% (10/14) + TEMPO spark; mobile
    375px → kartu 340px satu kolom; voting page bersih (Q2 tergembok).
  - Lint: 0 error (1 warning font pre-existing). Demo state di-reset.
  - PENTING (keisering): buffer `agent-browser console` MENYIMPAN error
    lama lintas navigasi — jangan percaya grep error mentah; verifikasi
  dengan reload + tail segar. Screenshot: download/qa16-* (f1 scoreboard-q1,
  f2 scoreboard-q2, f3 notes-tempo, f4 agg-results, f5 agg-mobile,
  f6 reveal-hint, b* baseline).

Stage Summary:
- Status: STABIL + 3 fitur baru (papan skor [P], strip tempo [N], ringkasan
  arsip) + styling papan skor sinematik.
- Pintasan S5 kini: [F] fallback · [R] reset · [E] ekspor CSV · [P] papan skor.
- File berubah: S5Polling.tsx (scoreFor + papan skor + hint), NotesPanel.tsx
  (strip tempo + import session/rehearsal), ResultsPage.tsx (timeline +
  agregat), HelpOverlay.tsx (baris [P]), globals.css (score-*/agg-card +
  print + reduced-motion). Tidak ada perubahan kontrak API/DB.
- Risiko: (a) VLM rawan mode "membangkitkan HTML" — selalu kunci instruksi
  "jangan tulis kode"; (b) buffer console browser QA menumpuk entri lama;
  (c) papan skor sengaja non-persist — menutup saat meninggalkan reveal
  (konteks kedaluwarsa), membuka lagi = [P] sekali lagi.
- Prioritas next (opsional): (1) preset durasi latihan per-babak [T] yang
  bisa disesuaikan; (2) ekspor ringkasan arsip sebagai PDF print-ready
  otomatis (tombol unduh .pdf selain window.print); (3) grafik agregat
  lintas-pertanyaan di layar penutup S8; (4) papan skor lintas dua
  pertanyaan gabungan di langkah terakhir S5.

---
Task ID: 17
Agent: main (Z.ai Code)
Task: QA baseline + dua fitur dari prioritas Task 16 — rekap sesi S8 [V] & bel suara tiba di S5

Work Log:
- Baca worklog (Task 16 STABIL). Smoke QA 1080p: server 200, G+8 S8, app
  load — LOLOS. Dipilih fokus: prioritas #3 (rekap penutup) + penyempurnaan
  audio (bel suara tiba).
- FITUR 1 — REKAP SESI S8 [V] (prioritas #3 Task 16, layar tanya jawab):
  - `S8Closing.tsx`: QaStats dirombak jadi SessionRecap — fetch full
    ResultsPayload per pertanyaan (bukan total saja), socket + HTTP 5 dtk
    tetap; [V] toggle detail (useSectionKeys + HUD ember).
  - Detail: dua kartu grid (PERTANYAAN 0X · N SUARA · angka % ketepatan besar
    · winner "B — label" / "SERI A / D" / "MENUNGGU SUARA"); garis aksen
    ember tipis di atas kartu (.rekap-card::before, versi contrast-boost);
    baris kompak lama tetap (T+ · total suara · perangkat) + hint
    "[V] RINGKAS/RINCIAN · ARSIP → /#/RESULTS".
  - Data awal null → parts menyembunyikan angka sampai termuat (tanpa
    kedip "0 SUARA").
- FITUR 2 — BEL SUARA TIBA di S5 (audio presenter):
  - `audio.ts`: metode chime() — dua nada sine C6+G6 (1046.5/1568 Hz),
    gain rendah (0.05/0.042), decay eksponensial; lewat master gain →
    ikut MUTE otomatis.
  - `S5Polling.tsx`: loadResults kini deps [live, fallback] + ref
    firstLoad — bel berbunyi HANYA saat total naik di layar live (bukan
    muatan awal, bukan fallback manual, bukan turun/reset). Satu corong
    (socket vote:new dan polling 3 dtk sama-sama lewat loadResults → tak
    ada bel ganda).
  - Ganti pertanyaan (Q1→Q2): total turun dari 14→0 → tanpa bel. Remount
    section: firstLoad reset → muatan awal tanpa bel.
- STYLING: .rekap-card (backdrop-blur bg-base/88 senada NotesPanel) + aksen
  ember ::before; HelpOverlay baris [V] (grup SESI & WAKTU).
- QA REGRESI (semua LOLOS, 0 error baru):
  - Rekap: seed 13+10 suara → "23 SUARA TEREKAM"; [V] buka → kartu 92%/90%
    + winner B benar; toggle tutup bersih; suara baru → 24 dalam ≤6 dtk
    (socket live); [V] di step awal → HUD feedback, kartu tetap tersembunyi
    (hanya step ≥ 5); VLM 1080p 3/3 PASS (tanpa overlap, kartu seimbang,
    aksen ember terlihat).
  - Bel: S5 live + suara masuk → RESPONDEN 14→15, delta error console = 0
    (jalur chime berjalan bersih); audio tidak bisa didengar programatik —
    diverifikasi lewat jalur eksekusi + master gain mute-aware.
  - Golden path: gerbang → kredit → S1 → Shift+S → S2; catatan [N]; peta
    [O]; HelpSheet baris [V]. Lint 0 error (1 warning pre-existing).
  - Demo state reset (votes 0, storage bersih). Screenshot: download/qa17-*
    (f1 rekap-detail).
- Catatan QA (berulang): buffer `agent-browser console` menumpuk entri
  lama lintas reload — selalu ukur DELTA jumlah error, bukan grep mentah.

Stage Summary:
- Status: STABIL + 2 fitur baru (rekap sesi [V] S8, bel suara tiba S5).
- Pintasan bertambah: [V] rekap sesi (S8, layar tanya jawab).
- File berubah: audio.ts (+chime), S5Polling.tsx (bel + import audio),
  S8Closing.tsx (SessionRecap + [V] + usePres/useSectionKeys/QUESTIONS),
  HelpOverlay.tsx (baris [V]), globals.css (.rekap-card + aksen). Kontrak
  API/DB tak tersentuh.
- Risiko: (a) bel hanya terdengar bila audio sudah di-init (gesture
  keydown pertama) dan tidak di-mute — perilaku disengaja; (b) VLM sesi
  lalu sempat "membangkitkan HTML" saat prompt bebas — prompt QA selalu
  kunci "jangan tulis kode"; (c) rekap detail tumbuh ke atas dari 13vh —
  aman terhadap headline "Terima kasih" (verifikasi VLM).
- Prioritas next (opsional): (1) preset tempo latihan yang bisa disetel
  per-babak (perluasan setRehearsal); (2) tombol unduh PDF otomatis arsip
  (selain window.print); (3) papan skor gabungan dua pertanyaan di langkah
  terakhir S5; (4) sweep audio halus pergantian babak (opsi [M]-aware).
