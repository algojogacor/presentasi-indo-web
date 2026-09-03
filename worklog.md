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
