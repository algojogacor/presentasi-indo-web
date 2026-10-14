import { describe, expect, it } from "bun:test";
import {
  getNextPresenterLocation,
  getPrevPresenterLocation,
  presenterWorkspaceReducer,
  type PresenterWorkspaceState,
} from "../../src/lib/presenterWorkspace";
import { SECTIONS } from "../../src/components/presentation/context";

describe("Unit: Presenter Workspace Isolation & Navigation", () => {
  const initialWorkspaceState: PresenterWorkspaceState = {
    section: 0,
    step: 0,
    fontSize: "base",
    mobileTab: "script",
    timerRunning: false,
    timerSeconds: 0,
  };

  describe("Step Forwards & Backwards Invariants", () => {
    it("berpindah langkah di dalam babak yang sama", () => {
      const loc = getNextPresenterLocation({ section: 0, step: 0 }, SECTIONS);
      expect(loc).toEqual({ section: 0, step: 1 });
    });

    it("melompat ke babak berikutnya langkah 0 ketika langkah terakhir babak tercapai", () => {
      // Babak 0 (OUVERTURE) memiliki 3 langkah (0, 1, 2)
      const loc = getNextPresenterLocation({ section: 0, step: 2 }, SECTIONS);
      expect(loc).toEqual({ section: 1, step: 0 });
    });

    it("tertahan di slide terakhir ketika sudah berada di ujung presentasi", () => {
      const lastSec = SECTIONS.length - 1; // 8
      const lastStep = SECTIONS[lastSec].steps - 1; // 8
      const loc = getNextPresenterLocation({ section: lastSec, step: lastStep }, SECTIONS);
      expect(loc).toEqual({ section: lastSec, step: lastStep });
    });

    it("mundur langkah di dalam babak yang sama", () => {
      const loc = getPrevPresenterLocation({ section: 0, step: 2 }, SECTIONS);
      expect(loc).toEqual({ section: 0, step: 1 });
    });

    it("mundur ke langkah terakhir babak sebelumnya ketika berada di langkah 0", () => {
      // Babak 1 langkah 0 mundur ke Babak 0 langkah 2
      const loc = getPrevPresenterLocation({ section: 1, step: 0 }, SECTIONS);
      expect(loc).toEqual({ section: 0, step: 2 });
    });

    it("tertahan di slide pertama ketika sudah berada di awal presentasi", () => {
      const loc = getPrevPresenterLocation({ section: 0, step: 0 }, SECTIONS);
      expect(loc).toEqual({ section: 0, step: 0 });
    });
  });

  describe("Reducer State Transitions", () => {
    it("menangani aksi NEXT_STEP dan PREV_STEP secara benar", () => {
      let state = presenterWorkspaceReducer(initialWorkspaceState, { type: "NEXT_STEP" }, SECTIONS);
      expect(state.section).toBe(0);
      expect(state.step).toBe(1);

      state = presenterWorkspaceReducer(state, { type: "PREV_STEP" }, SECTIONS);
      expect(state.section).toBe(0);
      expect(state.step).toBe(0);
    });

    it("melakukan clamping pada aksi SELECT_SECTION di luar rentang valid", () => {
      const stateUnderflow = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "SELECT_SECTION", section: -5 },
        SECTIONS,
      );
      expect(stateUnderflow.section).toBe(0);

      const stateOverflow = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "SELECT_SECTION", section: 99 },
        SECTIONS,
      );
      expect(stateOverflow.section).toBe(8);
    });

    it("mengatur font size dan mobile tab secara independen", () => {
      let state = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "SET_FONT_SIZE", fontSize: "xl" },
        SECTIONS,
      );
      expect(state.fontSize).toBe("xl");

      state = presenterWorkspaceReducer(
        state,
        { type: "SET_MOBILE_TAB", tab: "slide" },
        SECTIONS,
      );
      expect(state.mobileTab).toBe("slide");
    });

    it("mengelola stopwatch timer latihan secara independen", () => {
      let state = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "TOGGLE_TIMER" },
        SECTIONS,
      );
      expect(state.timerRunning).toBe(true);

      state = presenterWorkspaceReducer(state, { type: "TICK_TIMER" }, SECTIONS);
      state = presenterWorkspaceReducer(state, { type: "TICK_TIMER" }, SECTIONS);
      expect(state.timerSeconds).toBe(2);

      state = presenterWorkspaceReducer(state, { type: "RESET_TIMER" }, SECTIONS);
      expect(state.timerRunning).toBe(false);
      expect(state.timerSeconds).toBe(0);
    });
  });

  describe("Isolasi Total Terhadap Live Presentation & Live Polling", () => {
    it("memilih slide Section 5 (Polling) di /presenter TIDAK mengubah live state", () => {
      // Simulasi state live presentasi di Master View
      const livePresentation = {
        section: 2,
        step: 1,
        pollingStatus: "inactive",
      };

      // Presenter Workspace pengguna sedang mempelajari Section 5 (Polling)
      const workspace = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "SELECT_SECTION", section: 5 },
        SECTIONS,
      );

      expect(workspace.section).toBe(5);
      expect(workspace.step).toBe(0);

      // Verifikasi: Live presentation sama sekali tidak terpengaruh
      expect(livePresentation.section).toBe(2);
      expect(livePresentation.step).toBe(1);
      expect(livePresentation.pollingStatus).toBe("inactive");
    });

    it("live presentation update dari master TIDAK memaksa presenter workspace berpindah", () => {
      // Pengguna sedang membaca catatan naskah Babak 4
      const workspace = presenterWorkspaceReducer(
        initialWorkspaceState,
        { type: "SELECT_SECTION", section: 4 },
        SECTIONS,
      );

      // Master presenter di proyektor berpindah dari Babak 1 ke Babak 3
      const incomingMasterUpdate = { section: 3, step: 0 };

      // Verifikasi: Workspace pengguna tetap di Babak 4
      expect(workspace.section).toBe(4);
      expect(incomingMasterUpdate.section).toBe(3);
    });
  });
});
