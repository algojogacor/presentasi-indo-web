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
  const initialSettled = searchParams?.get("settled") !== "0";
  const initialAudience = searchParams?.get("audience") === "1";
  const initialSessionCode = searchParams?.get("sessionCode") ?? "";

  const [section, setSection] = useState(
    Number.isNaN(initialSection) ? 0 : initialSection
  );
  const [step, setStep] = useState(
    Number.isNaN(initialStep) ? 0 : initialStep
  );
  const [settled, setSettled] = useState(initialSettled);
  const [isAudience, setIsAudience] = useState(initialAudience);
  const [sessionCode, setSessionCode] = useState(initialSessionCode);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (
        e.data &&
        (e.data.type === "PREVIEW_SLIDE_CHANGE" ||
          e.data.type === "SLIDE_CHANGE")
      ) {
        if (typeof e.data.section === "number") setSection(e.data.section);
        if (typeof e.data.step === "number") setStep(e.data.step);
        if (typeof e.data.settled === "boolean") setSettled(e.data.settled);
        if (typeof e.data.isAudience === "boolean")
          setIsAudience(e.data.isAudience);
        if (typeof e.data.sessionCode === "string")
          setSessionCode(e.data.sessionCode);
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
      settled,
      setStep: (s) => setStep(s),
      goto: (sec, st = 0) => {
        setSection(sec);
        setStep(st);
      },
      registerKeyHandler: () => {},
      registerTimeline: (tl) => {
        if (tl && !settled) {
          tl.eventCallback("onComplete", () => {
            setSettled(true);
          });
        }
      },
      hud: () => {},
      sessionCode: sessionCode || undefined,
      isAudience,
    }),
    [section, step, settled, sessionCode, isAudience]
  );

  const CurrentComp = SECTION_COMPONENTS[section] ?? SECTION_COMPONENTS[0];

  return (
    <PresCtx.Provider value={mockApi}>
      <div className="fixed inset-0 overflow-hidden bg-base text-paper select-none">
        <div key={section} className="absolute inset-0">
          <CurrentComp step={step} />
        </div>
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
