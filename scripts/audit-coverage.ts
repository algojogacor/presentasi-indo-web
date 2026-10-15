import { SECTIONS } from "../src/components/presentation/context";
import { SPEAKER_NOTES, getSpeakerNote } from "../src/data/speakerNotes";
import { NOTE_PLAN } from "../src/lib/notesData";

console.log("=== PEMETAAN LENGKAP 55 SLIDE TERHADAP MAKALAH & SPEAKER NOTES ===\n");

SECTIONS.forEach((sec, sIdx) => {
  console.log(`\n========================================================`);
  console.log(`BABAK ${sIdx}: ${sec.label} (${sec.steps} Langkah)`);
  console.log(`========================================================`);
  for (let st = 0; st < sec.steps; st++) {
    const note = getSpeakerNote(sIdx, st);
    const plan = NOTE_PLAN[sIdx]?.[st];
    console.log(`- Step ${st}: [${note?.stepTitle}]`);
    console.log(`  Key Message: ${note?.keyMessage}`);
    console.log(`  Visual Context: ${note?.visualContext}`);
    console.log(`  Cue: ${plan?.c}`);
  }
});
