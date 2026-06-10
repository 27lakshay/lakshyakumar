"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";

import { prefersReducedMotion } from "@/lib/motion-preference";

const GridScan = dynamic(
  () => import("@/components/GridScan").then((m) => m.GridScan),
  { ssr: false },
);

const AsciiCharacterEffect = dynamic(
  () => import("@/components/ascii/AsciiCharacterEffect"),
  { ssr: false },
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

export type AsciiTunnelSection = {
  text: string;
  content: ReactNode;
};

const PERSPECTIVE = 1100;
const GAP = 780;
const SCROLL_PER_PANEL = 1;
const GRID_DEPTH_RANGE = 6;
const SCROLL_PAST_LAST_FRACTION = 0.3;
const SCAN_PAST_LAST_SECTION = 0.45;

function tunnelMetrics(panelCount: number) {
  if (panelCount < 1) {
    return {
      camMax: GAP,
      gridScale: GRID_DEPTH_RANGE / GAP,
      forwardMax: GRID_DEPTH_RANGE,
      scrollSections: 1,
    };
  }

  const lastSectionCam = (panelCount - 1) * GAP;
  const camMax = lastSectionCam + SCROLL_PAST_LAST_FRACTION * GAP;
  const forwardAtLastSection = GRID_DEPTH_RANGE * (lastSectionCam / camMax);
  const forwardMax = forwardAtLastSection + SCAN_PAST_LAST_SECTION;
  const gridScale = forwardMax / camMax;

  return {
    camMax,
    gridScale,
    forwardMax,
    scrollSections: camMax / GAP,
  };
}

const GRID_LINES = "#2F293A";
const GRID_SCAN = "#FF9FFC";
const FADE_OUT_FAR = 0.55 * GAP;

function apparentScale(worldZ: number) {
  return PERSPECTIVE / (PERSPECTIVE - worldZ);
}

function panelOpacity(index: number, worldZ: number) {
  if (index === 0) {
    if (worldZ <= 0) return 1;
    return gsap.utils.clamp(
      0,
      1,
      gsap.utils.mapRange(0, FADE_OUT_FAR, 1, 0, worldZ),
    );
  }

  const farZ = -GAP;
  if (worldZ < farZ) return 0;

  if (worldZ <= 0) {
    const farScale = apparentScale(farZ);
    const scale = apparentScale(worldZ);
    const t = gsap.utils.mapRange(farScale, 1, 0, 1, scale);
    return gsap.utils.clamp(0, 1, t * t);
  }

  return gsap.utils.clamp(
    0,
    1,
    gsap.utils.mapRange(0, FADE_OUT_FAR, 1, 0, worldZ),
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AsciiContentTunnel({
  sections,
}: {
  sections: AsciiTunnelSection[];
}) {
  const isClient = useIsClient();
  const motionEnabled = isClient && !prefersReducedMotion();
  const gridEnabled = motionEnabled;
  const asciiEnabled = motionEnabled;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  const pinRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const forwardRef = useRef(0);
  const { forwardMax } = tunnelMetrics(sections.length);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const pin = pinRef.current;
      if (!stage || !pin) return;

      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]", stage);
      const n = panels.length;
      if (n === 0) return;

      const { camMax, gridScale, scrollSections } = tunnelMetrics(n);
      const state = { cam: 0 };

      const apply = () => {
        let nextActiveIndex = 0;
        let minDist = Infinity;

        for (let i = 0; i < panels.length; i++) {
          const worldZ = -i * GAP + state.cam;
          const dist = Math.abs(worldZ);
          if (dist < minDist) {
            minDist = dist;
            nextActiveIndex = i;
          }
        }

        if (nextActiveIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextActiveIndex;
          setActiveIndex(nextActiveIndex);
        }

        for (let i = 0; i < panels.length; i++) {
          const panel = panels[i];
          const worldZ = -i * GAP + state.cam;
          const isActive = i === nextActiveIndex;
          const opacity = isActive ? panelOpacity(i, worldZ) : 0;
          gsap.set(panel, { z: worldZ, opacity });
          panel.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
        }

        forwardRef.current = state.cam * gridScale;
      };

      gsap.set(panels, {
        transformOrigin: "center center",
        willChange: "transform, opacity",
      });
      apply();

      const tween = gsap.to(state, {
        cam: camMax,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: () =>
            `+=${scrollSections * window.innerHeight * SCROLL_PER_PANEL}`,
          pin: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
          onUpdate: apply,
          onRefresh: apply,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: pinRef, dependencies: [sections.length] },
  );

  const activeText = sections[activeIndex]?.text ?? sections[0]?.text ?? "";

  return (
    <>
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        {gridEnabled && (
          <GridScan
            className="h-full w-full"
            enableWebcam={false}
            showPreview={false}
            enableGyro={false}
            scanOnClick={false}
            linesColor={GRID_LINES}
            scanColor={GRID_SCAN}
            scanOpacity={0.4}
            lineJitter={0.1}
            scanDepth={forwardMax}
            forwardRef={forwardRef}
            forwardEase={1}
          />
        )}
        <div className="absolute inset-0 bg-linear-to-b from-background/30 via-transparent to-background/50" />
      </div>

      <div ref={pinRef} className="relative h-dvh">
        {asciiEnabled && (
          <AsciiCharacterEffect
            text={activeText}
            loop={false}
            transparent
            className="pointer-events-none absolute inset-0 z-0"
          />
        )}

        <div
          ref={stageRef}
          className="absolute inset-0 z-10"
          style={{ perspective: `${PERSPECTIVE}px` }}
        >
          {sections.map((section, i) => (
            <div
              key={section.text}
              data-panel
              className="absolute inset-0 flex flex-col px-6"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              {asciiEnabled ? (
                <div className="flex flex-1 flex-col justify-end pb-10 pt-[52vh] md:pb-14">
                  <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
                    {section.content}
                  </div>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="w-full max-w-2xl p-8 md:p-12">
                    <p className="mb-6 font-mono text-4xl leading-[0.95] md:text-6xl">
                      {section.text}
                    </p>
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
