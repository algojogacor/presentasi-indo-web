"use client";

import { useEffect, useSyncExternalStore } from "react";
import Experience from "@/components/presentation/Experience";
import VotingPage from "@/components/voting/VotingPage";
import ResultsPage from "@/components/results/ResultsPage";

type Route = "present" | "vote" | "results";

function routeFromHash(): Route {
  const h = window.location.hash;
  if (h.startsWith("#/voting")) return "vote";
  if (h.startsWith("#/results")) return "results";
  return "present";
}

function subscribeHash(cb: () => void): () => void {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

export default function Page() {
  // Hash route (#/voting) sebagai external store — tanpa setState sinkron di effect
  const route = useSyncExternalStore(
    subscribeHash,
    () => routeFromHash(),
    () => "present" as Route,
  );

  useEffect(() => {
    document.body.style.overflow = route === "present" ? "hidden" : "";
    if (route !== "present") window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [route]);

  if (route === "vote") return <VotingPage />;
  if (route === "results") return <ResultsPage />;
  return <Experience />;
}
