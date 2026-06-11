"use client";

import { useState } from "react";

import Main from "@/components/Main";
import LightBar, {
  type LightBarDirection,
} from "@/components/light-bar/LightBar";
import Heading from "@/components/typography/Heading";
import Text from "@/components/typography/Text";

const DEFAULT_TEXT = "TypeScript, JavaScript, React, NextJS, HTML/CSS";

export default function LightBarDemo() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [direction, setDirection] = useState<LightBarDirection>("rtl");
  const [speed, setSpeed] = useState(40);

  const messages = text.trim() ? [text.trim()] : [DEFAULT_TEXT];

  return (
    <Main className="gap-10 pb-16">
      <div className="space-y-3">
        <Heading as="h1" size="lg">
          Light bar
        </Heading>
        <Text className="text-muted-foreground">
          Dot-matrix ticker with diffused LED glow under glass. Click the bar
          to cycle color, flicker a word, and crack the glass (up to 12 taps).
        </Text>
      </div>

      <label className="block space-y-2">
        <Text as="span" variant="mono" className="text-xs uppercase tracking-widest text-muted-foreground">
          Text
        </Text>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type ticker text…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </label>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            Direction
            <select
              value={direction}
              onChange={(e) =>
                setDirection(e.target.value as LightBarDirection)
              }
              className="rounded border border-border bg-background px-2 py-1 text-foreground"
            >
              <option value="rtl">Right to left (classic)</option>
              <option value="ltr">Left to right</option>
            </select>
          </label>
          <label className="flex items-center gap-2 font-mono text-sm text-muted-foreground">
            Speed
            <input
              type="range"
              min={10}
              max={120}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-32"
            />
            <span className="tabular-nums w-14">{speed}px/s</span>
          </label>
        </div>

        <LightBar messages={messages} direction={direction} speed={speed} />
      </div>
    </Main>
  );
}
