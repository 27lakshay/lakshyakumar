"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const IlluminatedTree = dynamic(
  () => import("@/components/tree/IlluminatedTree"),
  { ssr: false },
);

export default function LazyIlluminatedTree() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

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

  return (
    <div ref={containerRef} className="h-full w-full">
      {shouldLoad ? <IlluminatedTree /> : null}
    </div>
  );
}
