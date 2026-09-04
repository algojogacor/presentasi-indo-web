# Brief: Website Presentasi "Anatomi Karya Tulis Ilmiah"
**Kelompok 6 PDB 93 — Universitas Airlangga, 2026**

---

## Konteks & Tujuan

Ini bukan slide deck. Ini pengalaman presentasi berbasis browser yang dibawakan di depan kelas menggunakan proyektor fullscreen (F11). Audience: dosen + teman sekelas. Dinilai dari kreativitas, bukan hanya konten. Durasi presentasi: 1 jam penuh — tidak ada constraint waktu ketat.

Makalah sumbernya membahas: hakikat karya tulis ilmiah, struktur anatomi KTI (bagian awal/inti/akhir), variasi berdasarkan jenis KTI (makalah, artikel jurnal, skripsi, PKM), dan kaidah kebahasaan akademik.

Tujuan desain: orang yang melihat presentasi ini harus terpana. Bukan karena efek berlebihan, tapi karena terasa seperti pertunjukan yang dikoreografi dengan baik.

---

## Konsep Inti: "Academic Theater"

Presentasi ini dibawakan seperti pertunjukan. Setiap section adalah babak. Presenter adalah konduktor. Audience adalah penonton yang seharusnya duduk diam karena kagum.

Tone keseluruhan: **dark, sinematik, editorial**. Bukan estetika kampus generik. Bukan PowerPoint yang ditaruh di browser. Bukan template Canva yang diconvert ke web.

---

## Visual Direction

### Warna

- Base: `#0A0A0F` (hampir hitam, sedikit biru tua)
- Surface/card: `#111118`
- Text utama: `#F0EDE8` (off-white hangat)
- Text sekunder: `#6B6B7A`
- Accent tunggal: `#E8A020` (amber/dusty gold)
- Accent hover/active: `#FFB740`
- Divider/border halus: `rgba(255,255,255,0.07)`

**Contrast Boost Mode (shortcut `C`):** Toggle CSS variable yang menaikkan border ke `rgba(255,255,255,0.18)` dan teks sekunder ke `#9E9EA8`. Aktifkan jika proyektor ruang redup atau cahaya siang tembus tirai. Default: off.

Tidak ada gradient ungu-biru. Tidak ada aurora background. Grain texture tipis di background via SVG `<feTurbulence>` filter untuk kedalaman di proyektor.

### Typography

Tiga font, tidak lebih:
- **Display/Heading:** `Cormorant Garamond` — serif klasik berkarakter, kesan otoritatif dan akademik. Dipakai untuk headline section, judul besar, quote.
- **Body/UI:** `IBM Plex Sans` — bersih, sedikit teknikal, kontras dengan Cormorant. Dipakai untuk teks penjelasan, label, navigasi.
- **Monospace accent:** `IBM Plex Mono` — untuk label HUD presenter, koordinat state, metadata teknis kecil.

Hindari: Inter, Instrument Sans, Geist, General Sans — default AI yang sudah kehilangan karakternya.

Headline utama beberapa section di-scale pakai `vw` unit agar satu kata bisa memenuhi lebar layar.

### Texture & Depth

- Grain noise tipis di background: `filter: url(#noise)` via SVG `<feTurbulence>` inline
- Refined glassmorphism boleh untuk card tertentu, tapi kontras teks harus tetap tinggi — tidak ada glassmorphism berlapis
- Variasikan border-radius secara intentional: beberapa elemen tajam (0px), beberapa sedikit rounded (8px) — jangan seragam semua

---

## Navigasi & Kontrol Presenter

Semua kontrol keyboard-only. Tidak ada UI tombol next/prev yang terlihat di layar — audiens tidak perlu tahu shortcut ini.

| Shortcut | Fungsi |
|---|---|
| `Space` atau `→` | Lanjut ke langkah berikutnya |
| `←` | Kembali ke langkah sebelumnya |
| `G` lalu angka | Jump langsung ke section tertentu (misal `G3` = lompat ke Section 3) |
| `1`, `2`, `3` | Pilih bagian di Anatomy Theater |
| `B` | Mode komparasi di Battle Cards |
| `C` | Toggle Contrast Boost Mode |
| `M` | Toggle mute audio ambiens |
| `F` | Fallback mode polling (bypass QR, presenter klik manual) |
| `Shift+S` | Skip section video (lanjut ke Section 2) |
| `R` | Reset polling (POST /reset ke backend) |

**Arsitektur state navigasi:** Berbasis indeks terstruktur `[sectionIndex, stepIndex]`, bukan linear murni. Ini memungkinkan jump ke titik mana pun tanpa memutar balik seluruh animasi. Jika dosen minta "balik ke Bab III tadi", presenter bisa jump langsung tanpa panik.

**HUD Presenter:** Di sudut kiri bawah layar, tampilkan koordinat state dalam IBM Plex Mono 10px, warna `rgba(255,255,255,0.15)` — sangat redup, tidak menarik perhatian audiens tapi membantu presenter tahu posisi. Format: `ACT.04 // STEP.02`.

Semua navigasi harus responsif, tidak ada delay lebih dari 100ms setelah keypress.

---

## Struktur Pengalaman (Section by Section)

### Section 0 — Opening Cinematic

Layar gelap total. Satu kalimat muncul kata per kata dengan efek scramble/typewriter menggunakan GSAP TextPlugin:

> *"Setiap karya ilmiah punya tubuh. Hari ini kita bedah anatominya."*

Setelah kalimat penuh, jeda 1.2 detik. Lalu judul makalah muncul dalam Cormorant Garamond ukuran besar (6-8vw), per karakter dari kiri ke kanan dengan ease out. Nama kelompok dan dosen pembimbing fade in perlahan di bawah. Total durasi opening: 6-8 detik.

Bersamaan dengan kemunculan judul: **audio ambiens aktif** — dentum sub-bass sintetis halus (40-60 Hz, durasi ~2 detik, fade in/out) via Web Audio API. Tidak ada file MP3 — dihasilkan dari OscillatorNode + GainNode. Bisa di-mute kapan saja dengan `M`.

Navigasi dilanjutkan presenter dengan `Space` atau `→`.

### Section 1 — "Guest Lecturer" (YouTube Embed Theatrical)

Ini section kedua setelah opening, bukan di tengah. Posisi ini disengaja: video menjawab *"mengapa"* sebelum presentasi menjawab *"bagaimana"*.

**Kalimat pengantar presenter (dibacakan sebelum shortcut ditekan):**
> *"Sebelum kita membedah anatomi teks di atas meja operasi, mari kita dengarkan pandangan Guru Besar Fakultas Ilmu Komputer Universitas Indonesia, Prof. Wisnu Jatmiko, mengenai mengapa tubuh ilmiah ini harus dilahirkan dan dipublikasikan ke dunia..."*

Layar melakukan curtain-open animation: dua panel hitam bergerak ke kiri dan kanan, membuka frame di tengah yang berisi YouTube embed. Frame dibungkus UI yang terasa seperti siaran langsung:
- Label kecil `GUEST LECTURER` dengan dot merah berkedip
- Border tipis amber di sekeliling frame
- Nama pemateri di bawah: *"Prof. Wisnu Jatmiko — Guru Besar Fasilkom UI"*
- Sub-label: *"Seri Metodologi Penelitian & Penulisan Artikel Ilmiah"*

**Video:**
- URL: `https://www.youtube.com/watch?v=E6pPlIvlrPs`
- Judul: BAB 5 Part 1 — Pentingnya Menulis dan Mempublikasikan Artikel Ilmiah
- Channel: Lab1231 Fasilkom UI
- Durasi: 4 menit 41 detik, 1080p Full HD

Video putar. Setelah selesai (atau presenter tekan lanjut), frame collapse dengan animasi reverse curtain.

**Kalimat penutup presenter (dibacakan setelah video, sebelum lanjut):**
> *"Prof. Wisnu menegaskan bahwa gagasan ilmiah tidak akan pernah hidup tanpa sebuah tubuh tulisan yang baku. Sekarang, mari kita lihat anatomi yang menyusun tubuh tersebut."*

Fallback: shortcut `Shift+S` skip section ini langsung ke Section 2.

### Section 2 — Latar Belakang

Bukan bullet point. Satu pernyataan besar di tengah layar, Cormorant italic, 4vw:

> *"Banyak mahasiswa yang bisa menulis, tapi tidak tahu apa yang mereka tulis."*

Lalu fakta dan urgensi dari makalah muncul satu per satu saat presenter navigasi (bukan otomatis). Setiap fakta reveal dengan efek clip-path dari bawah ke atas. Setiap perpindahan langkah: suara tick analog mekanik sangat halus via Web Audio API (OscillatorNode frekuensi tinggi, durasi <50ms, gain sangat rendah).

### Section 3 — Hakikat & Karakteristik KTI

Teks definisi dari berbagai sumber (Wulandari et al., KBBI, Samal & Ardianto) muncul bergantian sebagai quote besar — Cormorant italic, satu definisi per layar. Bukan tabel, bukan list. Setiap definisi adalah momen.

Setelah definisi, 5 karakteristik KTI (Objektif, Logis, Sistematis, Cendekia, Verifikatif) tampil sebagai card horizontal yang muncul satu per satu saat presenter navigasi. Setiap card: angka besar (01-05) Cormorant, judul, satu kalimat penjelasan. Card hover: border amber muncul halus, tidak ada glow neon.

### Section 4 — "Anatomy Theater" (Section Utama)

Ini centerpiece presentasi. Visualisasi dokumen ilmiah seperti membedah tubuh — dengan pendekatan X-ray/autopsi.

**Layout split-screen:**
- Kiri: representasi visual dokumen KTI, dibangun dari SVG/div berlapis
- Kanan: panel penjelasan detail

**Visualisasi X-ray dokumen:**

Dokumen dirender sebagai lembar dokumen dengan lapisan transparan seperti rontgen medis — beberapa layer SVG yang bisa digeser/diungkap:

- **Layer terluar:** silhouette dokumen (cover, tepi halaman) — selalu terlihat
- **Layer tengah:** struktur tulang (garis-garis teks generik, nomor halaman, header/footer abstrak) — terlihat samar seperti rontgen
- **Layer dalam:** tiga blok anatomis (Preliminaries / Body Text / Postliminaries) dengan warna berbeda, awalnya semua redup

Saat presenter tekan `1` (Preliminaries):
- Layer Preliminaries menyala — opacity penuh, border amber muncul, elemen di dalamnya (judul, abstrak, daftar isi) ter-highlight
- Dua bagian lain bergeser halus ke atas dan bawah dengan efek irisan tipis, opacity turun ke 20%
- Panel kanan: konten detail Preliminaries expand dari atas dengan clip-path animation

Saat presenter tekan `2` (Body Text):
- Body Text melebar ke tengah — terasa seperti membuka rongga dokumen
- Sub-navigasi aktif: presenter tekan `A`–`E` untuk drill-down ke BAB I–V
- Setiap BAB expand inline di dalam blok Body Text, bukan modal/popup

Saat presenter tekan `3` (Postliminaries):
- Postliminaries ter-isolasi, dua bagian lain redup dan tergeser

Seluruh animasi: GSAP timeline, bukan CSS transition default.

### Section 5 — Sesi Interaktif (Live Polling)

Presenter: *"Sekarang kita test instingnya..."*

Pertanyaan pemantik muncul besar di layar (maksimal dua pertanyaan, satu per satu):

Contoh pertanyaan:
> *"Menurut kamu, apa perbedaan paling mendasar antara makalah dan artikel jurnal?"*

Opsi pilihan tampil sebagai card besar. Di bawah pertanyaan: QR code ke `/voting`.

**Cara kerja voting:**
- Audience scan QR → buka `/voting` di HP (form HTML ringan, satu klik, tanpa login)
- Submit → POST ke `/vote` di backend
- Presenter screen auto-fetch `GET /results` tiap 3 detik → bar chart update otomatis
- Bar chart: pure CSS bar dengan width di-set dari JavaScript, atau Chart.js minimal

**Threshold otomatis:** Jika dalam 15 detik pertama responden di bawah 10 orang, muncul notifikasi kecil di HUD presenter bahwa fallback tersedia.

**Fallback (`F`):** Matikan polling, presenter klik langsung salah satu opsi di layar. Animasi reveal jawaban tetap jalan.

Setelah reveal: transisi ke penjelasan singkat kenapa jawaban itu benar (teks muncul dari bawah).

### Section 6 — Variasi Jenis KTI: "Battle Cards"

Empat jenis KTI (Makalah, Artikel Jurnal, Skripsi, Proposal PKM) tampil sebagai empat card besar.

Interaksi: presenter toggle satu card untuk "spotlight" — card yang dipilih membesar ke tengah, tiga lainnya mengecil ke sisi. Di dalam card spotlight: detail struktur dan karakteristik kunci muncul satu per satu.

Tombol `B`: aktifkan mode komparasi — semua card berdampingan, perbedaan kunci di-highlight dengan warna berbeda per kategori.

Transisi antar card: GSAP timeline.

### Section 7 — Kaidah Kebahasaan & Etika

Tiga poin utama (EYD V, Kalimat Efektif, Anti-Plagiarisme) ditampilkan sekuensial. Setiap poin punya contoh konkret: dua panel side-by-side "sebelum" (merah redup) vs "sesudah" (amber/hijau).

### Section 8 — Penutup / Simpulan

Kembali ke estetika opening: layar gelap, tipografi besar. Empat simpulan dari makalah muncul satu per satu — setiap simpulan satu kalimat pendek yang dibesarkan.

Setelah simpulan terakhir, kalimat dari Section 0 muncul lagi:

> *"Setiap karya ilmiah punya tubuh. Hari ini kita sudah bedah anatominya."*

Kata "sudah" berwarna amber — narasi yang selesai.

Terakhir: nama kelompok, terima kasih, ruang tanya jawab. Background tetap hidup — grain texture aktif, teks ambient sangat redup melayang di background dengan opacity sangat rendah.

---

## Teknis & Stack

### Frontend
- Vanilla HTML + CSS + JavaScript — tidak ada build step, tidak ada bundler
- GSAP + TextPlugin (CDN cdnjs) untuk animasi timeline dan text scramble
- Chart.js (CDN, modul bar saja) untuk polling bar chart
- Web Audio API native — tidak ada file MP3, semua audio dihasilkan dari OscillatorNode + GainNode secara programatik
- Google Fonts via `<link>`: `Cormorant Garamond` (400, 500, 600, italic), `IBM Plex Sans` (400, 500), `IBM Plex Mono` (400)
- SVG inline untuk grain texture dan visualisasi X-ray dokumen

### Backend Polling
- Runtime: Node.js dengan Hono
- Database: Turso (SQLite via libsql) — satu tabel `votes (id, option, created_at)`
- Endpoint:
  - `POST /vote` — body `{ option: string }`, simpan ke DB, return 200
  - `GET /results` — return `{ options: [{label, count}] }`
  - `POST /reset` — truncate votes, return 200
- CORS tidak jadi masalah — presentasi dan voting satu subdomain (`presentasi.aryariap.my.id`)
- Deploy di VM Arya

### Voting Page (`/voting`)
- HTML satu file, sangat ringan, mobile-first
- Satu pertanyaan, beberapa tombol pilihan
- Setelah submit: tombol disabled, tampilkan konfirmasi "Suaramu tercatat"
- Block double submit via localStorage flag
- Desain: tetap dark, simpel, terbaca di layar HP luar ruangan
- QR code ke `presentasi.aryariap.my.id/voting` — di-generate static sebelum presentasi

---

## Anti-AI-Slop Checklist (Wajib Dipatuhi Agent)

- Tidak ada Inter, Instrument Sans, atau Geist sebagai font utama
- Tidak ada gradient ungu-biru atau aurora background
- Tidak ada floating trust badge / pill di mana pun
- Tidak ada scroll indicator icon (mouse animasi)
- Tidak ada komponen dengan radius dan padding seragam di semua elemen
- Semua micro-interaction punya tujuan jelas (state change, arahkan atensi) — bukan fade-in seragam
- Tidak ada copy generik — semua teks spesifik ke materi makalah ini
- Glassmorphism hanya boleh satu lapisan, kontras teks tetap tinggi
- Tidak ada dashboard mockup atau grafik dekoratif tanpa makna
- Audio punya tujuan naratif (momen dramatis, feedback navigasi) — bukan background music terus-menerus

---

## Yang Tidak Boleh Dilakukan Agent

- Jangan pakai template presentasi yang sudah jadi (Reveal.js default, dll) tanpa modifikasi signifikan
- Jangan buat animasi yang hanya "terlihat keren" tanpa fungsi naratif
- Jangan tambahkan fitur yang belum ada di brief ini tanpa alasan yang jelas
- Jangan generate teks filler — semua teks di presentasi harus dari makalah asli atau ditulis dengan presisi
- Jangan pakai warna di luar palette yang sudah ditentukan kecuali untuk state (error/success)
- Jangan implementasi audio yang bergantung pada file eksternal — semua via Web Audio API programatik

---

## Catatan Akhir untuk Agent

Ini presentasi akademik yang harus terlihat seperti karya kreatif. Konteksnya ruang kelas dengan proyektor dan speaker yang bagus, bukan konferensi tech.

Resolusi proyektor: 16:9, 1280x720 atau 1920x1080. Semua elemen harus terbaca dari jarak 5-8 meter. Font size minimum body di layar: 18px. Headline section: minimum 4vw.

Tidak ada kebutuhan mobile responsiveness untuk presentasi utama. Voting page (`/voting`) harus mobile-friendly.

Makalah lengkap tersedia sebagai referensi konten. Semua fakta, definisi, dan poin yang ditampilkan harus dari makalah — tidak ada konten karang.

Untuk visualisasi X-ray di Section 4: implementasikan hanya jika hasilnya benar-benar bagus dan tidak mengorbankan performa atau kejelasan konten. Kalau hasilnya generik atau dipaksakan, fallback ke visualisasi blok anatomis solid dengan animasi yang dikerjakan sangat baik — satu hal yang sempurna lebih baik dari sepuluh hal yang mediocre.