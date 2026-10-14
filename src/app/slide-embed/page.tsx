"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PresCtx, type PresApi } from "@/components/presentation/context";
import { SECTION_COMPONENTS } from "@/components/presentation/sections";
import { Grain } from "@/components/presentation/atoms";

function SlideEmbedInner() {
  const searchParams = useSearchParams();
  const initialSection = Number(searchParams?.get("section") ?? "0");
  const initialStep = Number(searchParams?.get("step") ?? "0");

  const [section, setSection] = useState(
    Number.isNaN(initialSection) ? 0 : initialSection
  );
  const [step, setStep] = useState(
    Number.isNaN(initialStep) ? 0 : initialStep
  );

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === "PREVIEW_SLIDE_CHANGE") {
        if (typeof e.data.section === "number") setSection(e.data.section);
        if (typeof e.data.step === "number") setStep(e.data.step);
      }
    };

    window.addEventListener("message", onMessage);
    try {
      window.parent.postMessage({ type: "PREVIEW_EMBED_READY" }, "*");
    } catch (_) {}

    return () => window.removeEventListener("message", onMessage);
  }, []);

  const mockApi = useMemo<PresApi>(
    () => ({
      section,
      step,
      settled: true,
      setStep: (s) => setStep(s),
      goto: (sec, st = 0) => {
        setSection(sec);
        setStep(st);
      },
      registerKeyHandler: () => {},
      registerTimeline: () => {},
      hud: () => {},
    }),
    [section, step]
  );

  const CurrentComp = SECTION_COMPONENTS[section] ?? SECTION_COMPONENTS[0];

  return (
    <PresCtx.Provider value={mockApi}>
      <div className="fixed inset-0 overflow-hidden bg-base text-paper select-none">
        <CurrentComp step={step} />
        <Grain />
        <div className="vignette pointer-events-none" aria-hidden="true" />
      </div>
    </PresCtx.Provider>
  );
}

export default function SlideEmbedPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#0A0A0F]" />}>
      <SlideEmbedInner />
    </Suspense>
  );
}
