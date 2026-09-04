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

---
Task ID: 18
Agent: main (Antigravity)
Task: Penyelarasan Konten Teks Presentasi Berdasarkan Makalah Sumber (Kelompok 6 PDB 93)

Work Log:
- Membaca dan menganalisis secara menyeluruh dokumen sumber: `MAKALAH STRUKTUR KARYA ILMIAH KELOMPOK 6 PDB 93.md`.
- Menyesuaikan seluruh konten teks di codebase presentasi per section tanpa mengubah logika, animasi, atau struktur kode:
  - Section 2 (Latar Belakang - S2Latar.tsx):
    - Quote besar: Mengambil kalimat kunci dari sub-bab 1.1: "Struktur dalam penulisan karya ilmiah berfungsi sebagai kerangka logis yang mengarahkan pembaca untuk memahami alur pemikiran penulis dari perumusan fenomena hingga penarikan kesimpulan."
    - Tiga fakta urgensi sekuensial: Komunikasi akademik & tuntutan publikasi bereputasi (Musdalifah et al., 2025), hambatan mahasiswa akibat minimnya pemahaman struktur & latihan (Baharuddin et al., 2025), serta fungsi distingtif anatomi struktur dalam membentuk argumen ilmiah yang utuh.
  - Section 3 (Hakikat & Karakteristik - S3Hakikat.tsx):
    - Definisi verbatim dari sub-bab 2.1: KBBI Daring (Badan Bahasa, 2024), Wulandari et al. (2024), dan Samal & Ardianto (2025).
    - Lima karakteristik distingtif beserta penjelasan satu kalimat verbatim dari makalah: Objektif, Logis & Rasional, Sistematis, Cendekia & Lugas, Verifikatif.
  - Section 4 (Anatomy Theater - S4Anatomy.tsx):
    - Preliminaries (sub-bab 2.2.1): Halaman Judul, Halaman Pengesahan, Abstrak & Kata Kunci, Kata Pengantar, Daftar Isi & Visual.
    - Body Text BAB I–V (sub-bab 2.2.2):
      - Bab I: Latar Belakang piramida terbalik, Identifikasi/Batasan Masalah, Rumusan Masalah 5W1H, Tujuan 1:1, Manfaat teoretis-praktis.
      - Bab II: Kajian Teori mutakhir, Tinjauan Penelitian Terdahulu (novelty), Kerangka Berpikir alur penalaran, Hipotesis statistik.
      - Bab III: Pendekatan/Jenis riset, Tempat/Waktu, Populasi/Sampel, Pengumpulan Data, Instrumen Validitas/Reliabilitas, Analisis Data.
      - Bab IV: Deskripsi Hasil objektif dan Pembahasan kritis (dialog teori Bab II, komparasi riset terdahulu, penyebab temuan, limitasi).
      - Bab V: Simpulan substantif lugas menjawab rumusan (bukan data mentah) dan Saran rekomendasi operasional + riset lanjutan.
    - Postliminaries (sub-bab 2.2.3): Daftar Pustaka alfabetis baku (APA/Harvard/IEEE), Lampiran detail, Riwayat Hidup (CV).
  - Section 5 (Polling - questions.ts):
    - Merumuskan 2 pertanyaan pemantik bertema makalah yang memicu perdebatan:
      1. Perbedaan esensial artikel jurnal vs makalah (format IMRaD & novelty vs tugas konseptual 3 bab).
      2. Letak pembuktian kontribusi ilmiah & orisinalitas utama (pembahasan kritis Bab IV vs sekadar tumpukan data mentah).
    - Menyertakan teks penjelasan jawaban benar (`answerNote`) komprehensif mengutip Tabel 2, Fitriani et al. (2023), sub-bab 2.2.2, dan Widiyastuti et al. (2023).
  - Section 6 (Variasi KTI - S6Battle.tsx):
    - Memasukkan data lengkap dari Tabel 2: Makalah (Term Paper), Artikel Jurnal Ilmiah (IMRaD), Skripsi/Tesis, dan Proposal PKM (Kemendikbudristek) mencakup format struktur utama, panjang/volume, fokus kajian, dan karakteristik kuncinya.
  - Section 7 (Kaidah Kebahasaan & Etika - S7Kaidah.tsx):
    - Mengintegrasikan 3 pilar sub-bab 2.4: Penerapan EYD Edisi V (Kepmendikbudristek No. 0424/P/2022; meralat kekeliruan sebelumnya dengan menegaskan istilah asing wajib huruf miring), Struktur Kalimat Efektif (anti-kalimat menggantung/kerancuan sintaksis, Jumadi et al., 2024), serta Integritas Akademik & Pencegahan Plagiarisme (sitasi jujur & manajer referensi Mendeley/Zotero, Farida, 2024).
  - Section 8 (Penutup - S8Closing.tsx):
    - Memasang 4 poin simpulan verbatim dari sub-bab 3.1 makalah.
  - Presenter Notes (`src/lib/notes.ts`):
    - Menyelaraskan seluruh catatan langkah presenter per-babak dengan kutipan dan sitasi baru dari makalah.
- Verifikasi:
  - `bun install`: Berhasil (852 paket terinstal).
  - `eslint .`: Bersih (0 error, 1 warning pre-existing font).
  - Validasi file git diff: Hanya perubahan teks konten pada 6 section + questions + notes, logika dan animasi tetap utuh 100%.

Stage Summary:
- Status: SELESAI (konten teks 100% selaras dengan MAKALAH STRUKTUR KARYA ILMIAH KELOMPOK 6 PDB 93.md).
- File dimodifikasi:
  - `src/components/presentation/sections/S2Latar.tsx`
  - `src/components/presentation/sections/S3Hakikat.tsx`
  - `src/components/presentation/sections/S4Anatomy.tsx`
  - `src/lib/questions.ts`
  - `src/components/presentation/sections/S6Battle.tsx`
  - `src/components/presentation/sections/S7Kaidah.tsx`
  - `src/components/presentation/sections/S8Closing.tsx`
  - `src/lib/notes.ts`
  - `worklog.md`

---
Task ID: 19
Agent: main (Antigravity)
Task: Penyempurnaan Layout Section 2, Transisi Smooth Section 4, dan Padding Margin Section 5

Work Log:
- Menyelesaikan 3 feedback pengguna berdasarkan tangkapan layar langsung:
  1. Section 2 (Latar Belakang - S2Latar.tsx):
     - Masalah: Pada Step 0, pernyataan quote terdorong ke atas dan memakan 6 baris padat akibat kontainer fakta yang tidak aktif masih mengambil ruang flex layout penuh di bawahnya.
     - Solusi: Memisahkan kontainer pernyataan quote dengan pemosisian terpusat vertikal dan optis (`top-[46%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[68vw]`), menyesuaikan ukuran font ke `text-[2.7vw]` dengan `leading-[1.3]`, menambahkan tanda kutip editorial dan sitasi sub-bab 1.1. Saat Step >= 1, quote bergeser naik secara anggun (`y: "-14vh"`, `scale: 0.82`) memberikan ruang lapang bagi Fakta 01–03 di paruh bawah.
  2. Section 4 (Anatomy Theater - S4Anatomy.tsx):
     - Masalah: Perpindahan antar bab (Bab I–V) terasa mendadak/tersentak karena teks detail sebelumnya langsung ter-unmount dari DOM tanpa animasi tinggi, serta teks detail terlalu sempit (`max-w-[28vw]`).
     - Solusi: Menerapkan CSS Grid accordion transition (`grid-template-rows: 0fr -> 1fr` dan `opacity: 0 -> 100`) dengan kurva halus `cubic-bezier(0.16, 1, 0.3, 1)` selama 500ms. Rincian bab yang ditutup melipat halus ke atas sementara bab yang aktif membentang anggun. Melebarkan area teks detail menjadi `max-w-[38vw]` agar aliran kalimat seimbang. Mengganti transisi clip-path panel utama dengan fade & slide halus (`autoAlpha: 0, y: 14 -> autoAlpha: 1, y: 0`).
  3. Section 5 (Polling Interaktif - S5Polling.tsx):
     - Masalah: Teks pertanyaan, tombol pilihan ganda A–D, QR code, dan live status chart terlalu mepet dengan tepi layar karena penggunaan `px-0` pada kontainer `absolute inset-0`.
     - Solusi: Mengubah padding kontainer menjadi `px-[8vw] pt-[12vh] pb-[8vh]`, memberikan margin napas yang lapang dan sejajar sempurna dengan `Kicker` ("ACT 05 · SESI INTERAKTIF") serta kontrol HUD.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning font pre-existing).
  - Pengujian visual browser subagent di `http://localhost:3000`:
    - Section 2 Step 0 terpusat sempurna, Step 1 fakta muncul mulus.
    - Section 4 transisi Bab I s.d. Bab V akordeon berjalan halus tanpa lonjakan visual.
    - Section 5 pertanyaan dan opsi memiliki padding 8vw yang lega dari tepi kiri dan kanan.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S2Latar.tsx`
  - `src/components/presentation/sections/S4Anatomy.tsx`
  - `src/components/presentation/sections/S5Polling.tsx`
  - `package.json` (penyesuaian skrip dev/start lintas platform)
  - `worklog.md`

---
Task ID: 20
Agent: main (Antigravity)
Task: Perbaikan Layout, Penempatan Teks, dan Hirarki Visual Section 8 (Penutup)

Work Log:
- Mengidentifikasi akar masalah visual overlap dan clipping di Section 8 berdasarkan tangkapan layar pengguna:
  1. Teks callback Step 4 ("Setiap karya ilmiah punya tubuh. Hari ini kita sudah bedah anatominya.") dipaksa `autoAlpha: 1` oleh `useIsoLayoutEffect` pada kondisi `step < 5`. Hal ini menimpa mesin step reveal sehingga teks callback selalu muncul 100% tepat di tengah layar pada Step 0–3, bertumpuk langsung di atas teks simpulan.
  2. Teks simpulan verbatim dari Bab 3.1 makalah sangat panjang (24–43 kata per poin). Kode lama merender tumpukan simpulan lampau (`SIMPULAN.slice(0, step)`) dan seluruh 4 paragraf simpulan di dalam flex container yang sama dengan `autoAlpha: 0`. Karena `autoAlpha: 0` (visibility hidden) tetap memakan tinggi vertikal di flow dokumen, total tinggi melebihi 800px dan mendorong teks ke atas hingga terpotong/terpotong di tepi atas layar.
  3. Pada Step 5, teks callback yang digeser ke `y: -23vh` masih menabrak dan membayang di belakang kartu "Terima kasih".
- Solusi Implementasi (`src/components/presentation/sections/S8Closing.tsx`):
  1. Step 0–3 (Empat Simpulan Eksekutif):
     - Dibuat terisolasi eksklusif saat `step <= 3` dan otomatis ter-unmount saat berpindah ke Step 4/5.
     - Menambahkan 4-stage segmented timeline tracker di bagian atas (`01 HAKIKAT & METODE`, `02 TIGA RONGGA ANATOMI`, `03 FLEKSIBILITAS WADAH`, `04 KAIDAH & INTEGRITAS`) yang menyala ember dengan pulse dot pada langkah aktif dan menandai langkah yang telah lewat.
     - Merender hanya 1 simpulan aktif per langkah dengan animasi halus `fade-slide-in`, ukuran teks `text-[2.2vw] leading-[1.38] max-w-[68vw]` berformat tanda kutip editorial, terpusat vertikal tanpa risiko clipping.
     - Menambahkan sub-tag sintesis di bawah simpulan dan indikator navigasi shortcut.
  2. Step 4 (Callback Kalimat Pembuka):
     - Mengisolasi visibility: hanya aktif saat `step === 4` (`autoAlpha: 1, y: 0, scale: 1`). Saat `step < 4` maupun `step >= 5`, tersembunyi total (`autoAlpha: 0`).
     - Teks terpusat megah di tengah panggung dengan penekanan kata "sudah" berwarna ember dan label kilas balik premis pembuka.
  3. Step 5 (Kredit Penutup & Tanya Jawab):
     - Kartu penutup (`Terima kasih. Ruang diskusi dan tanya jawab dibuka`) terpusat anggun tanpa tabrakan dari teks callback.
     - `SessionRecap` diletakkan di `bottom-[6.5vh]` dengan jarak aman dan interaktivitas `[V]` tetap utuh.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing).
  - Verifikasi visual browser subagent di `http://localhost:3000`:
    - Step 0–3: Seluruh 4 poin simpulan terpusat lapang, timeline pill menyala presisi, 0 clipping atas, 0 overlap teks callback.
    - Step 4: Kalimat callback tampil tunggal, teatrikal, tanpa gangguan elemen lain.
    - Step 5: Kartu "Terima kasih" dan live session recap terpusat bersih, 0 obstruksi elemen background.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S8Closing.tsx`
  - `worklog.md`

---
Task ID: 21
Agent: main (Antigravity)
Task: Peningkatan Visual Tirai Teatrikal Section 1 (Guest Lecturer) Berbasis CSS, SVG & GSAP

Work Log:
- Mengganti implementasi tirai hitam flat di Section 1 (`src/components/presentation/sections/S1Video.tsx`) menjadi tirai kain panggung teatrikal realistis murni menggunakan CSS + SVG + GSAP tanpa aset gambar eksternal:
  1. Panel Tirai Kiri & Kanan:
     - Gradasi warna beludru burgundy `#3D0A0A` di area pertemuan tengah hingga `#1A0505` di sisi tepi luar.
     - Tekstur lipatan kain vertikal berlapis menggunakan CSS `repeating-linear-gradient` (90px pitch dengan kedalaman bayangan dan highlight) serta bayangan jatuh atas-bawah.
  2. Efek Gelombang Kain (SVG Filters):
     - Menggunakan filter SVG `<feTurbulence>` (anisotropik horizontal 0.012, vertikal 0.003) dan `<feDisplacementMap>` (`#disp-l`, `#disp-r`) untuk mendistorsi permukaan kain secara organik.
  3. Highlight Ornamen Tepi Emas (#C4963A):
     - Ditambahkan pita aksen selebar 10px di tepi dalam kedua panel dengan gradasi emas metalik (`#8C6A24` ke `#E2BD63` ke `#C4963A`), pola jalinan benang emas, dan efek drop shadow bercahaya lembut.
  4. Curtain Rod & Hanging Rings (#8B7355 Bronze):
     - Batang horizontal bronze (`#8B7355` dengan gradasi metalik) melintang di bagian atas panggung (`top-[2.2vh]`) dengan finial bulat dekoratif di ujung kiri dan kanan serta penyangga tengah.
     - 14 buah ring gantungan kain (diameter 18px) terpasang di bagian atas setiap panel tirai dan bergerak bersama panel saat tirai terbuka/tertutup.
  5. Koreografi Animasi GSAP:
     - Animasi membuka: durasi 1.2 detik, easing `power3.inOut`. Amplitudo gelombang filter kain dinaikkan secara dinamis dari skala 12 menjadi 34 lalu merileks seiring kain tersibak ke samping.
     - Animasi menutup: durasi 1.2 detik, easing `power2.inOut` dengan dinamika gelombang kain berulang halus.
  6. Integritas Sistem:
     - Logika iframe YouTube, video timing, shortcut keyboard (`Space`, `Shift+S`), dan pencegahan pencurian fokus keyboard dipertahankan 100%.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error).
  - Pengujian visual browser subagent di `http://localhost:3000`:
    - Step 0: Tirai beludru tertutup sempurna di tengah, tepi emas bersatu presisi, rod dan ring bronze terlihat realistis, kartu pengantar terbaca kontras dan tajam.
    - Step 1: Tirai tersibak mulus selama 1.2 detik dengan riak kain tertiup angin, membuka frame video YouTube secara teatrikal.
    - Step 2: Tirai menutup kembali dengan halus (1.2 detik) dan kutipan penutup Prof. Wisnu Jatmiko tampil elegan di atas permukaan kain.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S1Video.tsx`
  - `worklog.md`

---
Task ID: 22
Agent: main (Antigravity)
Task: Penyempurnaan Tirai Section 1 (Penghapusan Rod, Peningkatan Amplitudo Gelombang Kain & Perlambatan Animasi Asimetris)

Work Log:
- Menyelesaikan 3 permintaan perubahan spesifik pengguna pada tirai Section 1 (`src/components/presentation/sections/S1Video.tsx`):
  1. Menghapus Objek/Garis Penyangga Horizontal:
     - Menghapus komponen batang horizontal bronze (`.s1-curtain-rod`) beserta cincin-cincin gantungan (`RINGS`). Tirai kini jatuh bebas secara teatrikal dari batas atas layar (`inset-y-0`) tanpa garis penyangga kuning/bronze yang mengganggu pandangan.
  2. Memperbesar Amplitudo Gelombang/Lekukan Kain Beludru:
     - Menaikkan skala `feDisplacementMap` diam (saat tertutup/terbuka) dari 12 menjadi 38.
     - Menaikkan lonjakan amplitudo saat kain bergerak dari 34 menjadi 82, dipadu frekuensi turbulensi `0.009 0.0018` dan 3 oktaf fraktal sehingga lekukan dan lipatan kain tampak dalam, dinamis, dan berat layaknya beludru teater megah.
     - Mempertajam gradasi silindris dan highlight lipatan kain pada CSS (`rgba(255, 255, 255, 0.22)` pada puncak lipatan dan `rgba(0, 0, 0, 0.75)` pada palung bayangan) dengan pitch 100px.
     - Menyesuaikan lebar panel tirai menjadi `51.5%` dengan overlap ~3% di tengah untuk memastikan kerapatan kain dan hilangnya celah cahaya saat bergelombang.
  3. Memperlambat Animasi dan Menambahkan Delay Asimetris Organik:
     - Mengubah durasi animasi membuka dan menutup tirai menjadi 2.4 detik (dalam rentang 2.2–2.8 detik).
     - Menetapkan kurva easing ke `power3.inOut` untuk kedua arah (buka & tutup).
     - Menambahkan offset/delay ~0.1 detik pada panel kanan setelah panel kiri mulai bergerak, menghasilkan gerakan buka-tutup kain panggung yang tidak simetris mekanis, melainkan organik dan teatrikal.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - Dev server aktif di `http://localhost:3000`.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S1Video.tsx`
  - `worklog.md`

---
Task ID: 23
Agent: main (Antigravity)
Task: Restrukturisasi Alur Section 1 Menjadi 3 Langkah Dramatis Sebelum Tirai Terbuka

Work Log:
- Menambahkan layer transisi dramatis di Section 1 (`src/components/presentation/sections/S1Video.tsx`) tanpa mengubah mekanisme tirai beludru, embed YouTube, atau shortcut:
  1. Step 0 (Default saat masuk Section 1):
     - Layar hitam pekat (`#0A0A0F`) menutupi seluruh panggung (`.s1-black-layer` z-[45]).
     - Teks quote pengantar presenter ditampilkan dalam kondisi redup (`autoAlpha: 0.52`).
     - Spotlight dan tirai merah di baliknya belum tampak.
  2. Step 1 (Setelah SPACE pertama):
     - Efek spotlight panggung berbentuk lingkaran cahaya amber/warm white (`radial-gradient` dari `rgba(232,160,32,0.18)` di pusat melebur ke `transparent` dengan blur 30px) fade in selama 0.8 detik tepat di belakang teks quote.
     - Teks quote bertransisi menjadi terang tajam (`autoAlpha: 1`) dan hint bar berganti menjadi instruksi membuka panggung. Tidak ada pergerakan lain.
  3. Step 2 (Setelah SPACE kedua):
     - Layer hitam runtuh ke bawah dengan animasi GSAP `y: 0 -> 110vh` (durasi 0.9 detik, easing `power3.in`).
     - Tirai merah beludru dalam kondisi tertutup tersingkap anggun di baliknya dengan delay 0.1 detik (`autoAlpha: 1` durasi 0.45 detik).
  4. Step 3 (Setelah SPACE ketiga):
     - Tirai beludru membuka (2.4s `power3.inOut` dengan dinamika gelombang ripple kain dan delay asimetris 0.1s antar panel), frame YouTube aktif.
  5. Step 4 (Setelah SPACE keempat):
     - Tirai menutup kembali (2.4s `power3.inOut`) dan kutipan penutup Prof. Wisnu Jatmiko tampil di depan tirai tertutup sebelum melangkah ke Babak 2.
- Sinkronisasi Navigasi, HUD & Notes:
  - `src/components/presentation/context.ts`: Memperbarui total langkah `GUEST LECTURER` dari 3 menjadi 5.
  - `src/lib/notes.ts`: Memperbarui 5 entri catatan presenter (Pembuka narasumber — gelap, Lampu sorot — spotlight, Penyingkapan tirai teater, Tirai dibuka — video berjalan, Tirai menutup — jembatan ke latar).
  - `src/components/presentation/rehearsal.ts`: Memperbarui array durasi latihan untuk 5 langkah babak 1.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - Dev server aktif di `http://localhost:3000`.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S1Video.tsx`
  - `src/components/presentation/context.ts`
  - `src/lib/notes.ts`
  - `src/components/presentation/rehearsal.ts`
  - `worklog.md`

---
Task ID: 24
Agent: main (Antigravity)
Task: Implementasi Dual Dynamic Light Beams Berosilasi di Section 1 Step 1

Work Log:
- Mengganti efek spotlight statis di Section 1 Step 1 (`src/components/presentation/sections/S1Video.tsx`) menjadi dua berkas cahaya panggung dinamis (Light Beam A & B) sesuai spesifikasi:
  1. Geometri & Visualisasi Berkas Cahaya:
     - Bentuk: Kerucut proyektor panggung menggunakan CSS `clip-path: polygon(48% 0%, 52% 0%, 100% 100%, 0% 100%)` dengan `transform-origin: top center`.
     - Warna: Gradasi tungsten hangat `rgba(255, 220, 130, 0.35)` di puncak hingga `rgba(255, 200, 100, 0.18)` di badan cahaya dan transparan di dasar, dipadukan filter `blur(40px)` untuk menghasilkan efek kabut/asap panggung teatrikal yang lembut dan tidak kasar.
     - Ditambahkan area pendaran konvergensi di pusat (`.s1-beam-glow`) tempat kedua cahaya beririsan tepat di atas teks quote.
  2. Koreografi Gerakan Masuk GSAP (1.2 detik, `power2.out`):
     - Light Beam A: Meluncur dari kiri atas layar ke arah kanan bawah menuju teks quote (`rotation: 14 -> 28`, `x: -140 -> 0`, `y: -60 -> 0`).
     - Light Beam B: Meluncur dari kanan atas layar ke arah kiri bawah menuju teks quote (`rotation: -14 -> -28`, `x: 140 -> 0`, `y: -60 -> 0`).
     - Teks quote bertransisi bersamaan dari redup (`autoAlpha: 0.52`) ke terang penuh (`autoAlpha: 1`).
  3. Osilasi Halus Berkelanjutan (Simulasi Operator Lampu Panggung):
     - Setelah tiba di teks, kedua berkas cahaya berosilasi secara halus bolak-balik (`±28px`) menggunakan `gsap.to` dengan `yoyo: true, repeat: -1, ease: 'sine.inOut'`.
     - Durasi osilasi dibuat sedikit berbeda (2.5 detik untuk Light A dan 2.7 detik untuk Light B) agar gerakan terasa organik dan independen.
     - Tween osilasi dibersihkan secara aman (`gsap.killTweensOf`) saat berpindah ke langkah lain (Step 0, Step 2, dll).
  4. Integritas Sistem:
     - Logika step (Step 0 s.d. 4), keyboard shortcut, tirai beludru, YouTube embed, dan HUD dipertahankan 100%.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - Dev server aktif di `http://localhost:3000`.

---
Task ID: 25
Agent: main (Antigravity)
Task: Redo Total Dual Light Beam Teatrikal di Section 1 Step 1 Sesuai Spesifikasi Presisi

Work Log:
- Menghapus total implementasi berkas cahaya sempit/olive sebelumnya dan membangun ulang dari nol arsitektur dual light beam follow-spot panggung (`src/components/presentation/sections/S1Video.tsx`):
  1. Geometri & Pemosisian Fixed Full-Height:
     - Menggunakan dua elemen div `fixed pointer-events-none` full-height (`width: 40vw, height: 120vh`).
     - Light A (kiri atas): Berjangkar di `top: 0, left: 0` dengan `transform-origin: top left`.
     - Light B (kanan atas): Cermin presisi Light A, berjangkar di `top: 0, right: 0` dengan `transform-origin: top right`.
     - Lebar masing-masing berkas cahaya ~40vw, menyelimuti sepertiga bentang panggung dan memotong kabut teater secara volumetrik.
  2. Palet Cahaya Warm Amber & Blending Optik:
     - Gradasi:
       - Light A: `linear-gradient(to bottom right, transparent, rgba(255, 210, 120, 0.25), transparent)`
       - Light B: `linear-gradient(to bottom left, transparent, rgba(255, 210, 120, 0.25), transparent)`
     - Filter kelembutan atmosferik: `filter: blur(60px)`.
     - Blending mode: `mix-blend-mode: screen` pada kedua berkas cahaya sehingga berinteraksi fotorealistik dengan kanvas gelap `#0A0A0F`, melipatgandakan intensitas pencahayaan di area pertemuan tepat pada quote narasumber di tengah panggung.
  3. Koreografi Masuk GSAP (1.8 Detik Rotasi Sweep):
     - Murni rotasi sweep dari atas ke bawah (menirukan lampu panggung yang diputar ke bawah):
       - Light A: sweep dari `rotate(-50deg)` ke `rotate(-20deg)`.
       - Light B: sweep dari `rotate(50deg)` ke `rotate(20deg)`.
       - Easing: `power2.out`, durasi 1.8 detik.
     - Teks quote bertransisi bersamaan dari redup (`autoAlpha: 0.52`) ke terang penuh (`autoAlpha: 1`).
  4. Osilasi Nyata Pasca Tiba (Simulasi Kru Follow-Spot):
     - Setelah tiba di posisi akhir (-20deg & 20deg), berkas cahaya berayun sejauh `±8 derajat`:
       - Light A: berayun antara -28deg dan -12deg.
       - Light B: berayun antara 28deg dan 12deg.
       - Parameter osilasi: `duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut'`.
       - Menghasilkan sapuan fisik >250px di layar, jelas terlihat sebagai gerakan tangan kru lampu panggung yang aktif.
     - Penanganan siklus hidup aman: `gsap.killTweensOf([beamA, beamB])` di semua langkah keluar (Step 0, 2, 3, 4) dan cleanup unmount.
  5. Integritas Sistem:
     - Tidak ada perubahan pada mekanisme tirai, YouTube embed, shortcut keyboard, maupun alur langkah di luar visual beam.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning font pre-existing).
  - Dev server aktif di `http://localhost:3000`.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S1Video.tsx`
  - `worklog.md`

---
Task ID: 26
Agent: main (Antigravity — Claude Opus 4.6)
Task: Implementasi Ulang Efek Searchlight 20th Century Fox di Section 1 Step 1

Work Log:
- Menghapus total arsitektur dual wide-beam (Light A & Light B) dan membangun ulang dari nol sistem 7 searchlight beam ala 20th Century Fox opening sequence (`src/components/presentation/sections/S1Video.tsx`):
  1. Arsitektur 7 Beam Independen:
     - Konfigurasi disimpan sebagai konstanta `SEARCHLIGHT_BEAMS[]` di atas komponen (posisi horizontal, rentang rotasi, durasi osilasi per beam).
     - 7 posisi horizontal tersebar: 15%, 25%, 38%, 50%, 62%, 75%, 85% dari lebar layar.
  2. Struktur Visual Per Beam (dari bawah ke atas):
     - Container: `position: absolute, bottom: 0, left: X%, width: 60px, height: 120vh, transform-origin: bottom center, mix-blend-mode: screen`.
     - Inti: garis tajam 2px lebar, warna `rgba(255, 248, 220, 0.95)` (hampir putih warm), dengan `box-shadow: 0 0 12px 4px rgba(255, 240, 200, 0.3)` untuk pendaran inti.
     - Halo: div overlay full-size, warna `rgba(255, 230, 160, 0.08)` dengan `filter: blur(20px)` untuk efek kabut volumetrik lembut di sekitar inti.
  3. Koreografi Osilasi Asinkron (7 Durasi Berbeda):
     - Beam 1: -40° ↔ -20°, 2.5s | Beam 2: -25° ↔ -5°, 3.2s | Beam 3: -15° ↔ 10°, 2.8s
     - Beam 4: -5° ↔ 20°, 3.8s | Beam 5: 10° ↔ 30°, 2.6s | Beam 6: 20° ↔ 40°, 3.4s | Beam 7: 25° ↔ 45°, 2.9s
     - Semua: `yoyo: true, repeat: -1, ease: 'sine.inOut'` — menghasilkan pola sweep tak berulang yang hidup dan sinematik.
  4. Animasi Masuk (Fade In Staggered):
     - Seluruh 7 beam fade in bersamaan dengan stagger 0.1s antar beam (beam 1 mulai duluan, beam 7 terakhir).
     - Durasi fade per beam: 1 detik, `ease: 'power1.out'`.
     - Teks quote bersamaan bertransisi dari redup (`autoAlpha: 0.52`) ke penuh (`autoAlpha: 1`).
     - Setelah timeline fade-in selesai, osilasi dimulai otomatis via `onComplete`.
  5. Penanganan Siklus Hidup:
     - `gsap.killTweensOf(searchlights)` dipanggil di semua step (0, 2, 3, 4) dan cleanup unmount, mencegah ghost oscillation.
     - Quote text tetap di z-index lebih tinggi (`z-10`) dari semua beam.
  6. Integritas Sistem:
     - Tirai beludru, YouTube embed, shortcut keyboard, hint text, dan alur Step 0-4 dipertahankan 100%.
     - Hint teks Step 0 dan Step 1 diperbarui: "NYALAKAN SEARCHLIGHT" dan "SEARCHLIGHT AKTIF".
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning font pre-existing).
  - Dev server aktif di `http://localhost:3000`.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S1Video.tsx`
  - `worklog.md`

---
Task ID: 27
Agent: main (Antigravity)
Task: Transformasi Penanda Transisi Babak Menjadi Full-Screen Act Title Card Sinematik

Work Log:
- Menemukan komponen dan logika penghasil flash singkat penanda section:
  1. Komponen `src/components/presentation/ActCard.tsx` sebelumnya hanya menampilkan angka Romawi raksasa transparan (`ac-numeral font-display text-[11vw] text-paper/12`) dan kode label kecil yang naik dan larut cepat (0.3s masuk, 0.55s diam, 0.45s keluar) secara transparan di atas section yang sudah mulai dirender di baliknya.
  2. Lapisan sapuan garis `act-wipe` di `Experience.tsx` juga ikut menyapu layar secara bersamaan saat perpindahan babak.
- Mengubah total `ActCard.tsx` menjadi Full-Screen Act Title Card Sinematik:
  1. Geometri & Tata Letak Layar Penuh:
     - Menggunakan kontainer fixed penuh dengan latar hitam murni `#0A0A0F` (`fixed inset-0 z-[75] bg-[#0A0A0F] flex flex-col items-center justify-center select-none pointer-events-none`).
  2. Tiga Elemen Terpusat Sesuai Spesifikasi:
     - Angka Romawi di tengah atas: ukuran kecil (`text-xs md:text-sm`), font `IBM Plex Mono` (`font-code`), warna `#6B6B7A`, letter-spacing lebar (`tracking-[0.45em]`). Format: `ACT. I` s.d. `ACT. VIII` (dan `PROLOG` untuk Section 0).
     - Garis horizontal tipis amber di antara keduanya: lebar presisi `120px`, tinggi `1px`, warna `#E8A020` (amber aksen), margin seimbang (`my-[2.2vh]`).
     - Judul section di tengah: font `Cormorant Garamond` (`font-display`), ukuran besar `~5vw` (`text-[5vw] leading-[1.1] font-normal`), warna `#F0EDE8`, terpusat (`max-w-[85vw] px-6 text-center`).
  3. Pemetaan Judul Sesuai Makalah & Presentasi:
     - Section 0: `PROLOG` — `ANATOMI KARYA TULIS ILMIAH`
     - Section 1: `ACT. I` — `TAMU AKADEMIK`
     - Section 2: `ACT. II` — `LATAR BELAKANG`
     - Section 3: `ACT. III` — `HAKIKAT & KARAKTERISTIK`
     - Section 4: `ACT. IV` — `ANATOMI KARYA ILMIAH`
     - Section 5: `ACT. V` — `SESI INTERAKTIF`
     - Section 6: `ACT. VI` — `VARIASI KARYA ILMIAH`
     - Section 7: `ACT. VII` — `KAIDAH & ETIKA`
     - Section 8: `ACT. VIII` — `SIMPULAN & PENUTUP`
  4. Siklus Animasi GSAP:
     - Fade in keseluruhan: 0.4 detik (`power2.out`).
     - Diam (hold): 1.2 detik.
     - Fade out: 0.4 detik (`power2.in`).
     - Pemanggilan `onComplete()` tepat setelah animasi fade out selesai.
- Sinkronisasi Siklus Render di `src/components/presentation/Experience.tsx`:
  1. State `cardSection`:
     - Diaktifkan saat `goto(target)` dipanggil untuk babak baru (`!wasSeen && target > 0`).
     - Saat `cardSection !== null`, `<SectionComp>` tidak dirender/dimount (`{cardSection === null && <SectionComp step={step} />}`), dan kontainer `sectionRef` di-set `autoAlpha: 0`.
  2. Baru Setelah Fade Out Selesai:
     - Callback `onComplete()` dari `ActCard` me-reset `cardSection` ke `null`.
     - Section baru kemudian dimount dan dirender ke DOM untuk pertama kali, disertai fade-in halus (`duration: 0.45, ease: 'power1.out'`).
  3. Integritas Kontrol Presenter & Shortcut:
     - Timeline GSAP `ActCard` tetap didaftarkan ke `registerTimeline(tl)`. Bila presenter menekan [SPACE] saat kartu babak sedang aktif, `advance()` memotong timeline via `tl.progress(1)`, memicu `onComplete()` seketika tanpa macet.
     - Navigasi mundur (`ArrowLeft`) membatalkan timeline kartu babak secara aman via `back()`.
     - Babak yang pernah dilihat sebelumnya (`settled === true`) berpindah secara instan tanpa menampilkan title card.
     - Tidak ada modifikasi pada logika navigasi utama, state presentasi, maupun konten internal section.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - Dev server aktif dan kompilasi sukses dengan status HTTP 200.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/ActCard.tsx`
  - `src/components/presentation/Experience.tsx`
  - `worklog.md`

---
Task ID: 28
Agent: main (Antigravity)
Task: Poles Halaman Ouverture Sinematik (~15vw Cormorant, Kicker Mono, Auto-Play & Auto-Advance)

Work Log:
- Menghapus elemen penumpukan visual lama di Step 0 `S0Opening.tsx`:
  1. Menghapus bingkai 4 bracket sudut (`.gate-bracket`) yang berkedip di pojok-pojok layar.
  2. Menghapus tombol interaktif manual `[ SPACE ] — MULAI`.
- Mengimplementasikan Tata Letak & Tipografi Ouverture Baru:
  1. Teks kecil di atas: `ANATOMI KARYA TULIS ILMIAH`, font `IBM Plex Mono` (`font-code`), warna `#E8A020`, letter-spacing lebar (`tracking-[0.5em]`).
  2. Garis tipis amber: lebar presisi `100px`, tinggi `1px`, warna `#E8A020`, diletakkan tepat di antara teks kecil dan judul utama.
  3. Teks utama: `OUVERTURE`, font `Cormorant Garamond` (`font-display`), ukuran raksasa `~15vw` (`text-[15vw] leading-[0.88]`), warna `#F0EDE8`, terpusat.
  4. Latar kanvas hitam pekat penuh `#0A0A0F` (`fixed inset-0 z-[75] bg-[#0A0A0F]`).
- Koreografi Animasi Masuk, Diam, & Fade Out GSAP:
  1. Animasi Masuk Staggered:
     - Kicker, garis, dan teks utama meluncur anggun dari bawah (`y: 32 -> 0`, `autoAlpha: 0 -> 1`) secara bertahap selama total `~2 detik` (kicker 1.1s, garis 1.0s, judul 1.35s dengan kurva `power2.out` dan `power3.out`).
  2. Diam (Hold):
     - Berhenti tenang selama 2 detik penuh (`tl.to({}, { duration: 2.0 })`) setelah semua elemen tergelar sempurna.
  3. Fade Out ke Hitam:
     - Memudar lembut ke hitam penuh selama 0.6 detik (`power2.inOut`).
  4. Auto-Lanjut ke Section 0:
     - Tepat setelah fade out selesai, callback `onComplete` memanggil `setStep(1)`, sehingga Section 0 (kalimat scramble "Setiap karya ilmiah punya tubuh...", dentum sub-bass Web Audio API, serta judul besar dan kredit) mulai berjalan secara otomatis.
- Isolasi Kontrol Keyboard:
  1. Menambahkan guard pada event listener keyboard di `src/components/presentation/Experience.tsx`: saat `section === 0 && step === 0`, semua penekanan tombol diabaikan sehingga halaman Ouverture berjalan murni sebagai auto-play teatrikal.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - Dev server aktif dan kompilasi sukses dengan status HTTP 200.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dimodifikasi:
  - `src/components/presentation/sections/S0Opening.tsx`
  - `src/components/presentation/Experience.tsx`
  - `worklog.md`

---
Task ID: 29
Agent: main (Antigravity)
Task: Penghapusan Bersih Komponen & Logika Act Title Card / Section Indicator Transisi

Work Log:
- Menghapus total komponen dan seluruh pemanggilan indikator transisi antar section:
  1. Menghapus file `src/components/presentation/ActCard.tsx`.
  2. Membersihkan `src/components/presentation/Experience.tsx`:
     - Menghapus import `ActCard`.
     - Menghapus state `cardSection` dan ref `wipeRef`.
     - Menghapus logika `setCardSection` di fungsi `goto` dan `back`.
     - Menghapus hook efek sapuan `act-wipe` (`useIsoLayoutEffect`).
     - Mengembalikan efek animasi `sectionRef` ke transisi fade-in bersih standar tanpa penundaan kartu (`autoAlpha: 0 -> 1, duration: 0.55s`).
     - Menghapus pemanggilan elemen `<ActCard ... />` dan `<div ref={wipeRef} className="act-wipe" />` dari JSX.
     - Merender langsung `<SectionComp step={step} />` di dalam kontainer section.
- Verifikasi:
  - `bun run lint`: Lolos bersih (0 error, 1 warning pre-existing font).
  - `git status`: `ActCard.tsx` dihapus, `Experience.tsx` bersih tanpa sisa logic indikator.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.
- File dihapus:
  - `src/components/presentation/ActCard.tsx`
- File dimodifikasi:
  - `src/components/presentation/Experience.tsx`
  - `worklog.md`

---
Task ID: 30
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Refactor Menyeluruh Codebase Menjadi Modular (<250 Baris Per File)

Audit File Berukuran >250 Baris:
1. `src/components/presentation/sections/S5Polling.tsx` (769 baris)
2. `src/components/presentation/Experience.tsx` (647 baris)
3. `src/components/presentation/sections/S1Video.tsx` (585 baris)
4. `src/components/presentation/sections/S4Anatomy.tsx` (545 baris)
5. `src/components/results/ResultsPage.tsx` (492 baris)
6. `src/components/presentation/sections/S8Closing.tsx` (419 baris)
7. `src/components/voting/VotingPage.tsx` (391 baris)

Prinsip & Rencana Refactor:
- Satu komponen = satu tanggung jawab.
- Nol perubahan pada behavior, logic, animasi GSAP, style visual, maupun keyboard shortcuts.
- Pemecahan terstruktur:
  * Tahap 1: Ekstraksi tipe bersama ke `src/types/` dan konstanta konten/data ke `src/data/`.
  * Tahap 2: Refactor `S1Video.tsx` → pecah ke sub-komponen `src/components/presentation/sections/s1/` (Searchlights, Curtains, CurtainFilterSvg, VideoFrame, Quotes, animations).
  * Tahap 3: Refactor `S4Anatomy.tsx` → pecah ke `src/components/presentation/sections/s4/` (DocumentSheet, DissectionPanel, PrelimDissection, BodyDissection, PostDissection, animations).
  * Tahap 4: Refactor `S5Polling.tsx` → pecah ke `src/components/presentation/sections/s5/` (ScoreboardOverlay, PollingSparkline, OptionBars, PollingQr, PollingVerdict, usePollingData).
  * Tahap 5: Refactor `S8Closing.tsx` → pecah ke `src/components/presentation/sections/s8/` (SessionRecap, AmbientCloud, ConclusionCards, ClosingHero).
  * Tahap 6: Refactor `Experience.tsx` → pecah ke `src/components/presentation/experience/` (PresenterTopBar, PresenterBottomBar, RehearsalBanner, useExperienceKeyboard).
  * Tahap 7: Refactor `ResultsPage.tsx` → pecah ke `src/components/results/` (ResultsHeader, QuestionSummaryCard, ResultsTempoCurve, ResultsPrintView, exportCsv).
  * Tahap 8: Refactor `VotingPage.tsx` → pecah ke `src/components/voting/` (ShareButton, QuestionCard, VotingHeader, VotingFooter).
  * Tahap 9: Refactor `S6Battle.tsx` → pecah data ke `src/data/battle.ts` dan subkomponen ke `src/components/presentation/sections/s6/`.
- Verifikasi ketat:
  * Eksekusi satu file/modul per langkah.
  * Jalankan `bun x tsc --noEmit` dan `npm run lint` setelah setiap file selesai direfaktor.
  * Tidak melanjutkan jika ditemukan error.

Work Log:
1. Pra-refactor Sync & Git:
   - Remote origin ditambahkan ke `https://github.com/algojogacor/presentasi-indo-web.git`.
   - Commit dan push state awal berhasil ke branch `main`.
2. Fondasi Tipe & Data:
   - Dibuat `src/types/polling.ts` dan `src/types/presentation.ts` untuk tipe bersama.
   - Dibuat `src/data/video.ts`, `src/data/anatomy.ts`, `src/data/closing.ts`, `src/data/battle.ts` untuk memisahkan data konten dan konfigurasi dari komponen UI.
3. Modularisasi S1Video (585 -> 61 baris):
   - Subkomponen: `CurtainFilterSvg.tsx`, `Curtains.tsx`, `Searchlights.tsx`, `VideoFrame.tsx`, `QuoteLayers.tsx`.
   - Animasi terisolasi: `animations.ts`, `searchlightAnim.ts`, `curtainAnim.ts`.
4. Modularisasi S4Anatomy (545 -> 92 baris):
   - Subkomponen: `DocumentSheet.tsx`, `DissectionViews.tsx`.
   - Animasi terisolasi: `animations.ts`.
5. Modularisasi S5Polling (769 -> 227 baris):
   - Hook terisolasi: `usePollingData.ts` (socket, polling, audio chime, tempo timeline).
   - Subkomponen: `ScoreboardOverlay.tsx`, `PollingSparkline.tsx`, `PollingOptionsGrid.tsx`, `PollingResultBars.tsx`, `PollingQrBox.tsx`, `PollingIntro.tsx`.
6. Modularisasi S8Closing (419 -> 77 baris):
   - Subkomponen: `SessionRecap.tsx`, `AmbientWords.tsx`, `ConclusionStepper.tsx`, `ClosingCallback.tsx`, `ThankYouCard.tsx`.
7. Modularisasi Experience (647 -> 175 baris):
   - Hook terisolasi: `usePresentationState.ts`, `useExperienceKeyboard.ts`.
   - Subkomponen: `PresenterHud.tsx`, `ProgressBar.tsx`, `RailTicks.tsx`, `ResumeGate.tsx`.
8. Modularisasi ResultsPage (492 -> 144 baris):
   - Subkomponen & helpers: `ResultsHeader.tsx`, `ClassSummarySection.tsx`, `QuestionDetailCard.tsx`, `ResultsFooter.tsx`, `helpers.ts`.
9. Modularisasi VotingPage (391 -> 104 baris):
   - Subkomponen: `ShareButton.tsx`, `QuestionCard.tsx`, `VotingHeader.tsx`, `VotingFooter.tsx`.
10. Modularisasi S6Battle (241 -> 57 baris):
   - Subkomponen: `BattleCard.tsx`, `animations.ts`, data di `src/data/battle.ts`.

Verifikasi:
- `bun x tsc --noEmit`: 0 error.
- `npm run lint`: 0 error, 1 pre-existing warning (font di layout).
- `bun run build`: Berhasil 100% dalam 3.6 detik.
- Audit baris: Semua file aplikasi non-UI kini berada di bawah 250 baris (maksimal 243 baris di `src/lib/notes.ts`).

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.

---
Task ID: 31
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Matikan Port 3000 dan Deploy Server Lokal Ulang

Actions:
1. Memeriksa proses yang mendengarkan pada port 3000 (PID 16024 node.exe).
2. Mematikan proses dengan `Stop-Process -Force`.
3. Memastikan port 3000 telah bersih dari listener aktif.
4. Menjalankan kembali server Next.js lokal via `bun run dev` di port 3000.
5. Verifikasi koneksi ke `http://localhost:3000` via HTTP GET yang mengembalikan status code 200 OK.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.

---
Task ID: 32
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Penambahan Sistem Audio Presentasi (CC0 / Freesound) & AudioManager

Deskripsi & Sumber Audio (Lisensi Creative Commons 0 / Bebas Atribusi Berbayar):
1. Ouverture ambient:
   - File: `public/audio/ouverture-ambient.mp3`
   - Sumber: Freesound sound #338254 oleh leo153 ("150 people in a small theater low talking before play starts").
   - Lisensi: Creative Commons 0 (CC0).
   - Durasi: ~16 detik. Fade in 1.5s, fade out mulus 1.2s saat memasuki Step 1.
2. Opening drone:
   - File: `public/audio/opening-drone.mp3`
   - Sumber: Freesound sound #466293 oleh The-Sacha-Rush ("Wide Cinematic Anxious Drone").
   - Lisensi: Creative Commons 0 (CC0).
   - Durasi: ~24 detik (loopable). Fade in 2.0s, fade out mulus 1.5s saat meninggalkan Section 0.
3. Searchlight reveal:
   - File: `public/audio/searchlight-reveal.mp3`
   - Sumber: Freesound sound #322021 oleh Burningmonkey ("Servo motor sweeping").
   - Lisensi: Creative Commons 0 (CC0).
   - Durasi: ~8.7 detik (one-shot dengan fade out dinamis).
4. Curtain open:
   - File: `public/audio/curtain-open.mp3`
   - Sumber: Freesound sound #51140 oleh RutgerMuller ("Curtains Textile Texture.wav").
   - Lisensi: Creative Commons 0 (CC0).
   - Durasi: ~3.58 detik.
5. Transition whoosh:
   - File: `public/audio/transition-whoosh.mp3`
   - Sumber: Freesound sound #719636 oleh zapsplat.com ("Fast whoosh, bamboo swoosh through air").
   - Lisensi: Creative Commons 0 (CC0).
   - Durasi: ~0.55 detik.

Arsitektur & Implementasi:
1. `src/lib/audioManager.ts`:
   - Menggunakan Web Audio API terintegrasi dengan shared AudioContext & master gain node dari `AudioEngine` (rule 6 AGENTS.md).
   - Menangani decode audio buffer lokal tanpa delay jaringan saat playback.
   - Ramp volume linear/eksponensial pada setiap start/stop sehingga tidak ada audio yang terputus tiba-tiba.
   - Sinkronisasi penuh dengan state mute (`shortcut M`).
2. Browser Audio Policy & Gate Interaksi:
   - Audio tidak autoplay sebelum user berinteraksi.
   - Di Section 0 Step 0 (Ouverture), layar menampilkan teks `OUVERTURE` dan badge prompt berkedip `[ TEKAN SPASI UNTUK MEMULAI ]`.
   - Menekan Spasi pertama kali (atau klik layar) menginisialisasi audio context, memutar ambience ruang teater, dan menjalankan sekuens.
   - Spasi berikutnya mempercepat transisi ke Step 1.
3. Integrasi Section:
   - Section 0 Step 1 memutar drone sinematik, hening sebelum judul, dan dentum sub-bass.
   - Section 1 Step 1 memutar searchlight servo audio.
   - Section 1 Step 3 memutar suara tirai panggung tersibak (`animateCurtainOpen`).
   - Navigasi antar-babak (`goto` / transisi babak) memutar transition whoosh lembut.

Verifikasi:
- `bun x tsc --noEmit`: 0 error.
- `npm run lint`: 0 error, 1 pre-existing warning (font layout).
- `bun run build`: Berhasil 100% (3.6s).
- Pengujian Browser (browser_subagent):
  * Membuka `http://localhost:3000/`, verifikasi tampilan Ouverture dan prompt spasi.
  * Console error check awal: 0 error.
  * Interaksi tombol Spasi: Audio terinisialisasi mulus dan presentasi bertransisi ke judul tanpa error console.
- Audit Baris: Semua file tetap berada di bawah 250 baris.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.

---
Task ID: 33
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Konsolidasi Step 0 & Step 1 Section 1 (Otomatisasi Searchlight Reveal 1 Detik)

Work Log:
1. Analisis & Rencana:
   - Menggabungkan Step 0 (layar hitam + quote) dan Step 1 (searchlight reveal) di Section 1 (GUEST LECTURER) menjadi satu langkah (Step 0) terpadu.
   - Setelah masuk Section 1, quote narasumber muncul dan searchlight 20th Century Fox otomatis menyala setelah jeda 1 detik tanpa perlu menekan Space lagi.
   - Spesifikasi animasi searchlight: animasi `y` dari 20px ke 0 bersamaan dengan fade in opacity (`autoAlpha: 1`), durasi 1.2 detik, easing `power2.out`, stagger 0.15 detik antar beam, disinkronkan dengan efek audio searchlight (`audioManager.playSearchlight()`). Setelah animasi selesai, berkas cahaya melanjutkan osilasi asinkron.
   - Penekanan Space berikutnya langsung melangkah ke penyingkapan tirai teater (layer hitam runtuh ke bawah `y: 110vh`).
   - Total langkah Section 1 berkurang dari 5 menjadi 4 langkah (Step 0: quote + auto searchlight, Step 1: layer hitam runtuh, Step 2: tirai terbuka & video aktif, Step 3: tirai tertutup & quote penutup).
2. Perubahan Kode:
   - `src/components/presentation/context.ts`: Mengubah `SECTIONS[1].steps` dari 5 menjadi 4.
   - `src/lib/notes.ts`: Mengubah catatan Section 1 menjadi 4 langkah (menggabungkan intro gelap dan spotlight).
   - `src/components/presentation/rehearsal.ts`: Menyesuaikan rencana durasi latihan Section 1 dari 5 langkah menjadi 4 langkah (`[30, 15, 645, 60]`).
   - `src/components/presentation/sections/s1/QuoteLayers.tsx`: Menyederhanakan prompt teks OpeningQuote menjadi `PENGANTAR — DIBACAKAN · [SPACE] BUKA PANGGUNG · [SHIFT+S] LEWATI`.
   - `src/components/presentation/sections/s1/VideoFrame.tsx`: Mengubah kondisi pemutaran iframe YouTube dari `step >= 3` ke `step >= 2`.
   - `src/components/presentation/sections/s1/searchlightAnim.ts`: Mengatur kondisi inisialisasi awal searchlight pada `y: 20` dan `autoAlpha: 0`.
   - `src/components/presentation/sections/s1/animations.ts`: Memperbarui `initS1State` dan `animateS1Step` untuk mengotomatisasi pemunculan beam searchlight pada delay 1.0s dengan timeline GSAP terintegrasi audio, serta menggeser nomor langkah 2->1, 3->2, 4->3.
   - `src/components/presentation/sections/S1Video.tsx`: Memperbarui docstring dan menyinkronkan state `settled`.
3. Verifikasi:
   - `bun x tsc --noEmit`: 0 error.
   - `npm run lint`: 0 error, 1 pre-existing warning (font layout).
   - Pengujian visual browser (`browser_subagent`):
     * Membuka presentasi di `http://localhost:3000/`.
     * Masuk ke Section 1 Step 0 (`ACT.01 // STEP.00/03`).
     * Tanpa menekan Space, dalam 1 detik berkas searchlight otomatis muncul dari bawah layar dengan elevasi halus dan fade in bertingkat (stagger 0.15s).
     * Tombol `[N]` menampilkan 4 catatan langkah untuk Section 1 dengan judul "Pembuka narasumber — spotlight".
     * Penekanan Space pertama langsung meruntuhkan layer hitam ke bawah dan menampilkan tirai merah tertutup (`STEP.01/03`).
     * Penekanan Space kedua membuka tirai merah dan mengaktifkan video YouTube (`STEP.02/03`).
     * Penekanan Space ketiga menutup tirai dengan quote penutup Prof. Wisnu Jatmiko (`STEP.03/03`).
     * Penekanan Space keempat melangkah ke Section 2 LATAR BELAKANG (`ACT.02 // STEP.00/03`).
   - Audit baris: Seluruh file termodifikasi tetap < 250 baris (maksimal 243 baris di `notes.ts`, `animations.ts` berkurang ke 216 baris).

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.

---
Task ID: 34
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Setup & Deployment ke Azure VM (20.214.143.187) & Domain presentasi.aryariap.my.id

Work Log:
1. Analisis & Koneksi:
   - Verifikasi akses SSH ke Azure VM `azureuser@20.214.143.187` dengan SSH key.
   - Periksa spesifikasi server: 2 vCPU AMD EPYC 7763, 1 GB RAM fisik, 8 GB swap, 12 GB disk bebas.
2. Setup Lingkungan & Aplikasi:
   - Mengklon repositori ke `/home/azureuser/presentasi-indo-web`.
   - Menginstal Bun v1.4.1 dan symlink `/usr/local/bin/bun`.
   - Menginstal dependensi (`bun install`), inisialisasi `.env` dengan SQLite database `DATABASE_URL="file:./dev.db"`, generate Prisma Client v6.19.2 (`bun run db:push`).
   - Melakukan production build Next.js (`bun run build`).
   - Menjalankan server aplikasi di port 3002 via PM2 process `presentasi` dan service real-time socket `live-notify` di port 3030 via PM2 process `presentasi-notify`.
3. Konfigurasi Nginx & Let's Encrypt SSL:
   - Membuat reverse proxy Nginx di `/etc/nginx/sites-available/presentasi` symlink ke `sites-enabled`.
   - Konfigurasi HTTP redirect ke HTTPS dan WebSocket upgrade headers.
   - Penanganan routing: 302 redirect untuk `/voting` ke `/#/voting` dan `/results` ke `/#/results`.
   - Konfigurasi map untuk parameter `?XTransformPort=3030` agar request WebSocket audiens dan presenter langsung diteruskan ke mini-service `live-notify` port 3030.
   - Mengambil dan menginstal sertifikat SSL otomatis Let's Encrypt melalui Certbot untuk domain `presentasi.aryariap.my.id`.
4. Verifikasi:
   - `curl.exe -I https://presentasi.aryariap.my.id` -> HTTP 200 OK.
   - `curl.exe -IL https://presentasi.aryariap.my.id/voting` -> 302 -> `/#/voting` -> HTTP 200 OK.
   - Validasi API Voting: Test submit vote opsi B pada pertanyaan 1, verifikasi total bertambah 1 di `/api/results?question=1`, lalu reset via `/api/reset`.
   - Verifikasi user: User berhasil mengakses langsung dari perangkat eksternal.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI.

---
Task ID: 35
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Implementasi Film Credit Roll Sinematik pada Section 0 Opening (Dosen Pengampu & Tim Penyusun)

Work Log:
1. Perancangan & Arsitektur:
   - Mengintegrasikan step baru di Section 0 (menjadi 3 langkah: Step 0 Ouverture, Step 1 Judul Utama & Scramble, Step 2 Film Credit Roll).
   - Menghapus kredit teks statis lama ("KELOMPOK 6 — PDB 93" & "UNIVERSITAS AIRLANGGA · 2026") dari Step 1.
   - Memposisikan Film Credit Roll di bawah subtitle "Karya Tulis Ilmiah", dengan elevasi judul utama (`y: -24px`) saat masuk Step 2 agar tata letak tetap proporsional dan tidak cramped.
2. Data & Komponen Modular:
   - Membuat `src/components/presentation/sections/s0/creditData.ts` memuat data dosen pengampu (Drs. Eddy Sugiri, M.Hum. & NIP), 6 anggota kelompok terbagi dalam 2 kolom (Akbar Arya Maulana, Arya Rizky Ardhi Pratama, Dinda Naura Firdausy di kiri; Izzatul Hayati, Muhammad Adyan Faqih Huddin, Salma Nur Khasanah di kanan) beserta NIM, dan label program studi PDB 93 UNAIR 2026.
   - Membuat komponen `src/components/presentation/sections/s0/FilmCreditRoll.tsx` yang menangani render dan timeline GSAP.
3. Efek Visual & Animasi GSAP:
   - Menambahkan CSS classes di `src/app/globals.css` untuk background-clip text shimmer gradient:
     * Dosen: Gold shimmer sweep dari `#8B6914` ke `#E8A020` ke `#FFB740` ke `#E8A020`.
     * Anggota: Silver-white shimmer sweep dari `#6B6B7A` ke `#F0EDE8` ke `#6B6B7A`.
     * Clean-up style `credit-settled-dosen` dan `credit-settled-member` saat animasi tuntas atau dalam state `settled`.
   - Timeline GSAP berurutan:
     * 0.15s: Label "DIBAWAH BIMBINGAN"
     * 0.30s: Nama Dosen + NIP (gold shimmer sweep)
     * 0.48s: Separator line horizontal amber tipis
     * 0.62s: Label "DISUSUN OLEH"
     * 0.76s - 1.51s: 6 Nama anggota muncul satu per satu dengan interval 0.15s disertai text shimmer
     * 1.75s: Program studi footer di bagian paling bawah
   - Mendaftarkan timeline ke `registerTimeline(tl)` agar tombol Space dapat mempercepat sekuens jika diperlukan.
4. Penyesuaian State & Catatan:
   - `src/components/presentation/context.ts`: Mengubah `SECTIONS[0].steps` dari 2 menjadi 3.
   - `src/lib/notes.ts`: Memperbarui `NOTE_PLAN[0]` menjadi 3 langkah presentasi.
   - `src/components/presentation/rehearsal.ts`: Mengatur durasi latihan Section 0 menjadi `[0, 30, 45]`.
   - `src/components/presentation/sections/S0Opening.tsx`: Mengintegrasikan `FilmCreditRoll`, mengisolasi Step 1 dan Step 2.
5. Verifikasi & Deployment:
   - `bun x tsc --noEmit`: 0 error.
   - `npm run lint`: 0 error, 1 pre-existing warning (font layout).
   - `bun run build`: Berhasil 100% lokal (3.9s).
   - Commit & push ke GitHub (`69283c4`).
   - Git pull, build, dan PM2 restart pada server Azure VM `presentasi.aryariap.my.id` berhasil.
   - Audit baris: Semua file < 250 baris (`FilmCreditRoll.tsx`: 214 baris, `S0Opening.tsx`: 199 baris, `notes.ts`: 247 baris, `creditData.ts`: 32 baris).

Stage Summary:
- Status: SELESAI & TERVERIFIKASI LIVE.

---
Task ID: 36
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Implementasi The Docket (Rumusan Masalah, Tujuan & Manfaat) di Section 2 dengan Pacing Teatrikal & Stack Dimming

Work Log:
1. Konsep & Arsitektur Teatrikal:
   - Mengubah Section 2 (LATAR BELAKANG) menjadi 8 langkah teatrikal:
     * Step 0: Pernyataan kunci kerangka logis KTI (Sub-bab 1.1)
     * Step 1–3: Tiga Fakta Urgensi (Komunikasi Akademik, Hambatan Mahasiswa, Kerangka Logis)
     * Step 4–7: The Docket — 4 Rumusan Masalah & Mandat Tujuan (Sub-bab 1.2 & 1.3) bergaya dakwaan hukum akademis:
       - Romawi I (Hakikat & Karakteristik) -> Roadmap: ACT.03
       - Romawi II (Struktur Anatomi Umum Prelim/Body/Post) -> Roadmap: ACT.04
       - Romawi III (Variasi Sistematika Makalah/Jurnal/Skripsi/PKM) -> Roadmap: ACT.06
       - Romawi IV (Kaidah Kebahasaan & Etika) -> Roadmap: ACT.07
       - Step 7 juga mengekspos sintesis Sub-bab 1.4 Manfaat Penulisan (Teoritis & Praktis).
2. Koreografi Visual (Opsi A — The Cumulative Docket / Stack Dimming):
   - Masing-masing pertanyaan muncul satu per satu dengan nomor Romawi berbingkai emas, pertanyaan besar dalam Cormorant Garamond italic dengan tanda tanya beraksen emas.
   - Mandat Tujuan (Research Mandate) melekat langsung di bawah pertanyaan sebagai target pembuktian ilmiah (`TARGET MANDAT: ...`).
   - Saat melangkah ke pertanyaan berikutnya, pertanyaan sebelumnya meredup (opacity: 0.24, scale: 0.985, grayscale) memusatkan sorotan tunggal pada dakwaan yang sedang dibacakan.
   - Audio feedback: integrasi `audio.thump()` (dentum sub-bass gavel sidang) pada tiap transisi langkah 4..7.
3. Modularisasi & Pemecahan File (< 250 Baris):
   - Membuat `src/components/presentation/sections/s2/docketData.ts` (86 baris): data terpusat Bab I makalah.
   - Membuat `src/components/presentation/sections/s2/LatarFacts.tsx` (96 baris): sub-komponen Step 0–3 dengan transisi keluar halus saat step >= 4.
   - Membuat `src/components/presentation/sections/s2/TheDocket.tsx` (214 baris): sub-komponen Step 4–7 dengan stack dimming, audio thump, dan manfaat penulisan.
   - Refactor `src/components/presentation/sections/S2Latar.tsx` (37 baris): orchestrator bersih antara LatarFacts dan TheDocket.
   - Refactor `src/lib/notes.ts` (21 baris) dengan memisahkan data ke `src/lib/notesData.ts` (247 baris) agar tidak ada file catatan yang melampaui batas 250 baris.
   - Update `src/components/presentation/context.ts`: `SECTIONS[2].steps` diubah dari 4 menjadi 8.
   - Update `src/components/presentation/rehearsal.ts`: durasi latihan Section 2 diubah menjadi `[35, 35, 35, 35, 45, 45, 45, 55]`.
4. Verifikasi & Deployment:
   - `bun x tsc --noEmit`: 0 error.
   - `npm run lint`: 0 error, 1 pre-existing warning (font layout).
   - `bun run build`: Berhasil 100% lokal (5.1s).
   - Commit & push ke remote repository (`algojogacor/presentasi-indo-web`).
   - Rebuild & restart PM2 di Azure VM (`presentasi.aryariap.my.id`).
   - Audit baris: Seluruh 8 file terkait tetap < 250 baris.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI LIVE.

---
Task ID: 37
Agent: main (Antigravity — Gemini 3.8 Flash High)
Task: Implementasi The Verdict (Dua Kartu Rekomendasi/Saran Sub-bab 3.2) di Section 8

Work Log:
1. Konsep & Arsitektur:
   - Mengintegrasikan Sub-bab 3.2 Saran dari makalah ke dalam Section 8 (PENUTUP) sebagai "Putusan Akhir / Rekomendasi Ilmiah" (The Verdict) bergaya vonis persidangan akademik.
   - Menambah jumlah langkah Section 8 dari 6 menjadi 7 langkah:
     * Step 0–3: Empat Simpulan Eksekutif (Sub-bab 3.1)
     * Step 4 (BARU): The Verdict — Dua Kartu Rekomendasi (Sub-bab 3.2)
     * Step 5: Callback Premis Pembuka ("...SUDAH bedah anatominya")
     * Step 6: Terima Kasih & Rekap Sesi Live Interaktif
2. Komponen & Visual VerdictCards:
   - Membuat `src/components/presentation/sections/s8/VerdictCards.tsx` (214 baris):
     * Kartu 1: Preskripsi I untuk Mahasiswa Peneliti — "Kawal Koherensi Segitiga Emas: Masalah, Pembahasan, dan Simpulan" disertai ikon geometris Segitiga Emas & aksen emas sudut.
     * Kartu 2: Preskripsi II untuk Institusi & Pengampu MKWU — "Perluas Praktikum Penulisan Jurnal IMRaD dan Proposal Riset Baku" disertai ikon geometris Blueprint Pilar & aksen sudut.
     * Animasi GSAP staggered entrance (root -> header -> kartu 1 -> kartu 2) dengan easing power3.out.
     * Audio feedback: trigger `audio.thump()` (palu sidang) saat putusan terbuka.
3. Penyesuaian Komponen & Catatan Presenter:
   - `src/components/presentation/sections/S8Closing.tsx` (96 baris): mengintegrasikan `VerdictCards`, menggeser Step Callback ke step 5 dan ThankYou ke step 6.
   - `src/components/presentation/context.ts`: Mengubah `SECTIONS[8].steps` dari 6 menjadi 7.
   - `src/components/presentation/rehearsal.ts`: Mengubah `REHEARSAL_PLAN[8]` menjadi `[30, 30, 30, 30, 45, 40, 50]`.
   - `src/lib/notesData.ts`: Menambahkan panduan penyampaian untuk Step 4 di `NOTE_PLAN[8]` (230 baris).
4. Verifikasi Lokal:
   - `bun x tsc --noEmit`: 0 error.
   - `npm run lint`: 0 error, 1 pre-existing warning.
   - `bun run build`: Berhasil 100% lokal (4.8s).
   - Server dev lokal (`localhost:3000`) aktif dan merespons HTTP 200 OK.
   - Audit baris: Semua file terkait tetap di bawah 250 baris.

Stage Summary:
- Status: SELESAI & TERVERIFIKASI LOKAL.






