import { gsap } from "gsap";
import { TextPlugin } from "gsap/TextPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { Flip } from "gsap/Flip";

if (typeof window !== "undefined") {
  gsap.registerPlugin(TextPlugin, ScrambleTextPlugin, Flip);
}

export { gsap, TextPlugin, ScrambleTextPlugin, Flip };
