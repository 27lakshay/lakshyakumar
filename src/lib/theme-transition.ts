"use client";

import { prefersReducedMotion } from "@/lib/motion-preference";

const TRANSITION_MS = 550;

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => ViewTransition;
};

function nextTheme(currentTheme: string | undefined) {
  return currentTheme === "light" ? "dark" : "light";
}

function supportsViewTransitions() {
  return (
    typeof document !== "undefined" &&
    "startViewTransition" in document &&
    typeof document.documentElement.animate === "function"
  );
}

export async function themeTransition(
  setTheme: (theme: string) => void,
  origin: HTMLElement,
  currentTheme: string | undefined,
) {
  const next = nextTheme(currentTheme);

  if (prefersReducedMotion() || !supportsViewTransitions()) {
    setTheme(next);
    return;
  }

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  const transition = (document as ViewTransitionDocument).startViewTransition!(
    () => {
      setTheme(next);
    },
  );

  try {
    await transition.ready;

    await document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: TRANSITION_MS,
        easing: "ease-out",
        pseudoElement: "::view-transition-new(root)",
      },
    ).finished;
  } catch {
    setTheme(next);
  }
}
