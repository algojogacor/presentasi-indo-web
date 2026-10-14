import { SECTIONS } from "@/components/presentation/context";

export interface PresenterLocation {
  section: number;
  step: number;
}

export interface PresenterWorkspaceState {
  section: number;
  step: number;
  fontSize: "sm" | "base" | "lg" | "xl";
  mobileTab: "script" | "slide";
  timerRunning: boolean;
  timerSeconds: number;
}

export type PresenterWorkspaceAction =
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SELECT_SECTION"; section: number }
  | { type: "SELECT_STEP"; step: number }
  | { type: "SET_FONT_SIZE"; fontSize: "sm" | "base" | "lg" | "xl" }
  | { type: "SET_MOBILE_TAB"; tab: "script" | "slide" }
  | { type: "TOGGLE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "TICK_TIMER" };

export function getNextPresenterLocation(
  curr: PresenterLocation,
  sections: { steps: number }[] = SECTIONS,
): PresenterLocation {
  const maxSteps = sections[curr.section]?.steps ?? 1;
  if (curr.step < maxSteps - 1) {
    return { section: curr.section, step: curr.step + 1 };
  }
  if (curr.section < sections.length - 1) {
    return { section: curr.section + 1, step: 0 };
  }
  return curr;
}

export function getPrevPresenterLocation(
  curr: PresenterLocation,
  sections: { steps: number }[] = SECTIONS,
): PresenterLocation {
  if (curr.step > 0) {
    return { section: curr.section, step: curr.step - 1 };
  }
  if (curr.section > 0) {
    const prevSec = curr.section - 1;
    const prevSteps = sections[prevSec]?.steps ?? 1;
    return { section: prevSec, step: prevSteps - 1 };
  }
  return curr;
}

export function presenterWorkspaceReducer(
  state: PresenterWorkspaceState,
  action: PresenterWorkspaceAction,
  sections: { steps: number }[] = SECTIONS,
): PresenterWorkspaceState {
  switch (action.type) {
    case "NEXT_STEP": {
      const nextLoc = getNextPresenterLocation(
        { section: state.section, step: state.step },
        sections,
      );
      return { ...state, section: nextLoc.section, step: nextLoc.step };
    }
    case "PREV_STEP": {
      const prevLoc = getPrevPresenterLocation(
        { section: state.section, step: state.step },
        sections,
      );
      return { ...state, section: prevLoc.section, step: prevLoc.step };
    }
    case "SELECT_SECTION": {
      const clampedSection = Math.max(0, Math.min(action.section, sections.length - 1));
      return { ...state, section: clampedSection, step: 0 };
    }
    case "SELECT_STEP": {
      const maxSteps = sections[state.section]?.steps ?? 1;
      const clampedStep = Math.max(0, Math.min(action.step, maxSteps - 1));
      return { ...state, step: clampedStep };
    }
    case "SET_FONT_SIZE":
      return { ...state, fontSize: action.fontSize };
    case "SET_MOBILE_TAB":
      return { ...state, mobileTab: action.tab };
    case "TOGGLE_TIMER":
      return { ...state, timerRunning: !state.timerRunning };
    case "RESET_TIMER":
      return { ...state, timerRunning: false, timerSeconds: 0 };
    case "TICK_TIMER":
      return state.timerRunning ? { ...state, timerSeconds: state.timerSeconds + 1 } : state;
    default:
      return state;
  }
}
