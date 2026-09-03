// Prewarm tautan ke mini-service live-notify saat server Next.js menyala,
// agar suara pertama yang masuk sudah bisa disiarkan instan (tanpa menunggu
// koneksi socket terbentuk saat handler pertama dijalankan).

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { prewarm } = await import("./lib/notify");
    prewarm();
  }
}
