    # AGENTS.md — Presentasi KTI "Academic Theater"
**Kelompok 6 PDB 93 — Universitas Airlangga, 2026**

Ini file instruksi utama untuk semua coding agent yang bekerja di repository ini.
Berlaku untuk seluruh tahap: development, debugging, styling, deployment, dan dokumentasi.

---

## 1. Baca Ini Dulu Sebelum Menyentuh Kode

Baca file-file berikut sebelum melakukan perubahan apapun:

- `AGENTS.md` — file ini. Aturan permanen project-wide.
- `brief-presentasi-kti.md` — sumber kebenaran utama. Semua keputusan desain, fitur, konten, dan arsitektur ada di sini. Jika ada konflik antara instruksi chat dan brief, **brief yang menang**.
- `PROJECT_STATE.md` — status implementasi terkini (apa yang sudah jadi, apa yang belum).
- `WORKLOG.md` — log sesi kerja kronologis.

Jangan mulai implementasi sebelum membaca keempat file di atas.

---

## 2. Gambaran Project

Website presentasi akademik berbasis browser untuk mata kuliah PDB 93 UNAIR. Dibawakan langsung di depan kelas menggunakan proyektor fullscreen (F11). Bukan slide deck. Bukan template. Ini pengalaman teatrikal yang dikoreografi.

**Stack:**
- Frontend: Vanilla HTML + CSS + JavaScript (tidak ada framework, tidak ada build step)
- Animasi: GSAP + TextPlugin via CDN cdnjs
- Chart: Chart.js via CDN (modul bar saja)
- Audio: Web Audio API native (tidak ada file MP3 eksternal)
- Font: Google Fonts — Cormorant Garamond, IBM Plex Sans, IBM Plex Mono
- Backend polling: Node.js + Hono + Turso (SQLite via libsql)
- Deploy: VM Arya di `presentasi.aryariap.my.id`
- Voting audience: `presentasi.aryariap.my.id/voting`

**Struktur file yang diantisipasi:**
```
/
├── index.html          # Presentasi utama
├── voting.html         # Halaman voting audience (mobile-first)
├── style.css           # CSS utama + CSS variables palette
├── main.js             # Logic navigasi, GSAP, Web Audio API
├── polling.js          # Fetch /results tiap 3 detik, render bar chart
├── server/
│   └── index.js        # Hono server: /vote, /results, /reset
└── assets/
    └── qr.png          # QR code ke /voting (generate sebelum hari-H)
```

---

## 3. Sumber Kebenaran Konten

Semua teks, definisi, fakta, dan poin yang ditampilkan di presentasi **harus berasal dari makalah asli**. Tidak ada konten karang. Tidak ada teks filler.

Makalah sumber: `brief-presentasi-kti.md` memuat ringkasan konten. Untuk teks verbatim, rujuk dokumen makalah yang disertakan user.

Jika sebuah fakta tidak ada di makalah dan tidak ada di brief, jangan dikarang — tandai sebagai `[PERLU KONFIRMASI USER]` dan lanjutkan bagian lain.

---

## 4. Aturan Desain — Tidak Boleh Dilanggar

Palette warna sudah ditetapkan di brief. Tidak ada deviasi:

```css
--color-base: #0A0A0F;
--color-surface: #111118;
--color-text-primary: #F0EDE8;
--color-text-secondary: #6B6B7A;
--color-accent: #E8A020;
--color-accent-hover: #FFB740;
--color-border: rgba(255, 255, 255, 0.07);

/* Contrast Boost Mode (toggle via shortcut C) */
--color-border-boost: rgba(255, 255, 255, 0.18);
--color-text-secondary-boost: #9E9EA8;
```

Font sudah ditetapkan. Tidak ada font lain:
- Heading/display: `Cormorant Garamond`
- Body/UI: `IBM Plex Sans`
- Monospace accent: `IBM Plex Mono`

Pastikan font benar-benar di-load via `<link>` Google Fonts di `<head>` — jangan hanya tulis nama di CSS tanpa import. Fallback ke system font diam-diam adalah bug.

**Anti-AI-slop yang wajib dijaga:**
- Tidak ada gradient ungu-biru atau aurora background
- Tidak ada komponen dengan radius/padding seragam di semua elemen — variasikan secara intentional
- Tidak ada micro-interaction fade-in seragam di semua elemen — setiap animasi harus punya tujuan naratif
- Tidak ada copy generik aspirasional
- Glassmorphism maksimal satu lapisan, kontras teks tetap tinggi
- Audio via Web Audio API saja — tidak ada file MP3/OGG eksternal

---

## 5. Aturan Animasi & GSAP

Gunakan GSAP untuk semua animasi yang kompleks. CSS transition hanya untuk state sederhana (hover, focus).

Aturan GSAP:
- Selalu gunakan `gsap.timeline()` untuk urutan animasi, bukan setTimeout berantai
- Gunakan easing yang tepat per konteks: `power2.out` untuk reveal, `power3.inOut` untuk transisi besar, `elastic.out` untuk elemen yang "muncul"
- Jangan gunakan `gsap.to()` untuk animasi yang butuh dibalik — pakai timeline dengan `.reverse()`
- State navigasi berbasis indeks `[sectionIndex, stepIndex]` — bukan linear murni

Untuk text scramble di Section 0, gunakan GSAP TextPlugin:
```js
gsap.registerPlugin(TextPlugin);
```

Pastikan TextPlugin di-load dari CDN yang sama dengan GSAP inti.

---

## 6. Aturan Web Audio API

Semua audio dihasilkan programatik. Tidak ada file eksternal.

Dua jenis audio yang digunakan:

**Sub-bass opening (Section 0):**
```js
// OscillatorNode type: 'sine', frequency: 40-60 Hz
// GainNode: fade in 0.3s, sustain, fade out 0.5s
// Durasi total: ~2 detik
```

**Tick navigasi (setiap perpindahan langkah):**
```js
// OscillatorNode type: 'square' atau 'triangle', frequency: 800-1200 Hz
// GainNode: gain sangat rendah (~0.05), durasi <50ms
// Ini bukan beep keras — hampir tidak terdengar, hanya feedback taktil auditori
```

Mute toggle via shortcut `M` — simpan state mute di variable global, check sebelum setiap AudioContext play.

Jangan buat AudioContext baru setiap kali bunyi diputar. Buat satu AudioContext global, reuse untuk semua suara.

---

## 7. Aturan Navigasi & State

Sistem navigasi menggunakan state terstruktur, bukan linear:

```js
const state = {
  section: 0,      // index section aktif (0-8)
  step: 0,         // index langkah dalam section
  anatomy: null,   // null | 'prelim' | 'body' | 'post' (Section 4)
  bodyBab: null,   // null | 'I' | 'II' | 'III' | 'IV' | 'V' (drill-down Section 4)
  pollActive: true, // true = fetch polling aktif, false = fallback mode
  muted: false,
  contrastBoost: false
};
```

Jump shortcut `G` + angka harus langsung set `state.section` ke target dan render tanpa animasi masuk (atau dengan animasi singkat). Jangan putar balik seluruh timeline.

HUD presenter: render ulang setiap kali state berubah. Format: `ACT.0{section} // STEP.0{step}`. Posisi: fixed, kiri bawah, `pointer-events: none`.

---

## 8. Aturan Backend Polling

Tiga endpoint, tidak lebih:

```
POST /vote      body: { option: string }    → 200 OK
GET  /results   → { options: [{label: string, count: number}] }
POST /reset     → 200 OK (truncate tabel votes)
```

Tabel Turso:
```sql
CREATE TABLE IF NOT EXISTS votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  option TEXT NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
```

Polling dari presenter screen: `setInterval(() => fetchResults(), 3000)`. Hentikan interval saat `state.pollActive === false`.

Threshold otomatis: jika total votes < 10 setelah 15 detik pertama polling aktif, tampilkan notifikasi di HUD (`FALLBACK AVAILABLE — tekan F`). Jangan otomatis switch ke fallback — biarkan presenter yang memutuskan.

Double-submit prevention di voting page: set `localStorage.setItem('voted', '1')` setelah submit berhasil. Cek di awal load — jika sudah ada, tampilkan pesan "Kamu sudah memberikan suara" dan disable semua tombol.

---

## 9. Aturan Section 4 (Anatomy Theater) — Prioritas Utama

Ini section paling kompleks dan paling penting. Kerjakan dengan teliti.

Visualisasi X-ray dokumen dibangun dari SVG inline berlapis, bukan gambar atau div sederhana:

```
Layer 1 (terluar): silhouette dokumen — selalu visible, opacity 1
Layer 2 (tengah):  "tulang" dokumen — garis teks abstrak, header/footer — visible saat idle, opacity ~0.4
Layer 3 (dalam):   tiga blok anatomis (Prelim/Body/Post) — awalnya redup
```

Saat salah satu blok diaktifkan (shortcut `1`, `2`, `3`):
- Blok aktif: opacity 1, border amber via GSAP
- Dua blok lain: GSAP animate ke opacity 0.15, sedikit translateY menjauh dari blok aktif
- Panel kanan: clip-path reveal dari atas (`clipPath: 'inset(0% 0% 100% 0%)'` → `'inset(0% 0% 0% 0%)'`)

Jika visualisasi X-ray SVG berlapis tidak menghasilkan output yang bagus dan jelas, fallback ke visualisasi blok anatomis solid dengan animasi yang dikerjakan sangat baik. Satu hal yang sempurna lebih baik dari sepuluh hal yang mediocre. Tandai keputusan ini di `WORKLOG.md`.

---

## 10. Aturan Proyektor

Semua elemen harus terbaca dari jarak 5-8 meter.

- Font size minimum body di layar: `18px`
- Headline section: minimum `4vw`
- Target resolusi: 1280x720 dan 1920x1080 (16:9)
- Tidak ada kebutuhan mobile responsiveness untuk `index.html`
- `voting.html` harus mobile-friendly (diakses dari HP audience)

Contrast Boost Mode (`C`): toggle CSS variables `--color-border` dan `--color-text-secondary` ke nilai boost. Implementasi via `document.documentElement.style.setProperty(...)`. Tidak ada reload halaman.

---

## 11. Yang Tidak Boleh Dilakukan

- Jangan pakai Reveal.js, Impress.js, atau framework presentasi lain sebagai base — ini custom dari nol
- Jangan tambahkan dependency npm yang tidak ada di brief tanpa alasan konkret dan dokumentasi di WORKLOG
- Jangan generate teks konten sendiri — semua dari makalah
- Jangan pakai warna di luar palette kecuali untuk state error/success
- Jangan buat animasi yang tidak punya fungsi naratif
- Jangan buat AudioContext baru per suara — satu AudioContext global
- Jangan hardcode path atau URL — gunakan variable atau konstanta di atas file

---

## 12. Worklog Session

Setiap sesi kerja bermakna, tulis entri di `WORKLOG.md`:

**Di awal sesi:**
- Tanggal, waktu mulai (Asia/Jakarta)
- Agent/model yang digunakan
- User request
- Scope task
- Status: `In progress`

**Setelah milestone:**
- File yang diinspeksi
- File yang diubah
- Keputusan desain yang dibuat (beserta alasannya)
- Bug yang ditemukan dan cara fix-nya

**Di akhir sesi:**
- File yang dibuat/diubah/dihapus
- Status akhir: `Completed` / `Partial` / `Blocked`
- Pekerjaan yang tersisa
- Langkah aman berikutnya yang bisa dilakukan agent lain

`WORKLOG.md` adalah append-only. Jangan hapus atau rewrite entri sebelumnya.

---

## 13. Project State

`PROJECT_STATE.md` mendeskripsikan kondisi sistem saat ini, bukan histori sesi.

Update hanya ketika ada perubahan nyata pada:
- Fitur yang sudah selesai vs belum
- Bug yang diketahui
- Status deploy
- Environment variables yang dibutuhkan
- Perubahan arsitektur

Bedakan dengan jelas:
- `Verified` — sudah dicek langsung
- `Inferred` — diasumsikan dari kode
- `Not verified` — belum dicek

---

## 14. Deployment

Deploy target: VM Arya, subdomain `presentasi.aryariap.my.id`.

Sebelum klaim "sudah deploy":
- Verifikasi URL bisa diakses
- Verifikasi `/voting` bisa diakses dari mobile
- Verifikasi endpoint `/results` return JSON yang benar
- Catat hasil verifikasi di WORKLOG

Jangan klaim deploy berhasil hanya dari output terminal lokal.

---

## 15. Urutan Kerja yang Direkomendasikan

```
Baca AGENTS.md
→ baca brief-presentasi-kti.md (seluruhnya)
→ baca PROJECT_STATE.md
→ baca WORKLOG.md sesi terbaru
→ inspeksi file yang ada di repo
→ buat/update entri WORKLOG
→ implementasi (prioritas: Section 4 Anatomy Theater → navigasi state → audio → polling)
→ test di browser (fullscreen, keyboard navigation)
→ update PROJECT_STATE.md jika ada perubahan
→ finalisasi WORKLOG
```

Prioritas implementasi:
1. Struktur HTML + CSS variables + font loading — fondasi harus benar dulu
2. Navigasi keyboard + state management — tanpa ini, presentasi tidak bisa dibawakan
3. Section 0 opening cinematic + GSAP — first impression
4. Section 4 Anatomy Theater — centerpiece, paling kompleks
5. Backend polling + voting page — fitur interaktif
6. Section lainnya secara berurutan
7. Audio, HUD, Contrast Boost — polish terakhir