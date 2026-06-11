"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import ErrorBoundary from "@/components/ErrorBoundary";
import { cn } from "@/lib/utils";

const IlluminatedTree = dynamic(
  () => import("@/components/tree/IlluminatedTree"),
  { ssr: false },
);

const Dither = dynamic(() => import("@/components/Dither"), { ssr: false });

export default function LazyIlluminatedTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [ditherVisible, setDitherVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad) return;

    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDitherVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {shouldLoad ? (
        <>
          <ErrorBoundary fallback={null}>
            <div
              className={cn(
                "absolute inset-0 z-0 opacity-0 transition-opacity duration-2000 ease-in motion-reduce:opacity-20 motion-reduce:transition-none",
                ditherVisible && "opacity-20",
              )}
            >
              <Dither
                waveColor={[
                  0.3686274509803922, 0.9176470588235294, 0.8313725490196079,
                ]}
                disableAnimation={false}
                enableMouseInteraction={false}
                mouseRadius={1}
                colorNum={10}
                pixelSize={2}
                waveAmplitude={0.4}
                waveFrequency={3}
                waveSpeed={0.01}
              />
            </div>
          </ErrorBoundary>
          <div className="relative z-10 h-full w-full">
            <IlluminatedTree />
          </div>
        </>
      ) : null}
    </div>
  );
}
