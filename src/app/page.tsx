"use client";

import { useEffect, useSyncExternalStore } from "react";
import Experience from "@/components/presentation/Experience";
import VotingPage from "@/components/voting/VotingPage";

type Route = "present" | "vote";

function routeFromHash(): Route {
  return window.location.hash.startsWith("#/voting") ? "vote" : "present";
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
    if (route === "vote") window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = "";
    };
  }, [route]);

  return route === "vote" ? <VotingPage /> : <Experience />;
}
