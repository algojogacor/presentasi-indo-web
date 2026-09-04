import { useCallback, useState } from "react";
import { Share2, Check } from "lucide-react";

/** Tombol bagikan tautan voting — Web Share API, fallback salin ke clipboard. */
export default function ShareButton() {
  const [copied, setCopied] = useState(false);
  const share = useCallback(async () => {
    const url = `${window.location.origin}/#/voting`;
    const data = {
      title: "Live Polling — Anatomi KTI",
      text: "Ikutan voting live di kelas — buka dari HP-mu:",
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* pengguna membatalkan share — diam */
    }
  }, []);

  return (
    <button
      type="button"
      onClick={share}
      className="mt-5 flex w-full items-center justify-center gap-2.5 border border-ember/60 py-3.5 font-code text-[11px] tracking-[0.22em] text-ember transition-colors hover:bg-ember/10 focus-visible:bg-ember/10 focus-visible:outline-1 focus-visible:outline-ember"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" aria-hidden />
          TAUTAN DISALIN
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" aria-hidden />
          BAGIKAN KE TEMAN
        </>
      )}
    </button>
  );
}
