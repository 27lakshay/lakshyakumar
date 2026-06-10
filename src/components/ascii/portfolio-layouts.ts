import { resume } from "@/content/resume";

export type LayoutFonts = {
  mono: string;
  sans: string;
};

export type PortfolioLayoutRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fonts: LayoutFonts,
) => void;

function drawStrokedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  font: string,
  size: number,
) {
  ctx.font = `${size}px ${font}`;
  ctx.lineWidth = Math.max(1.5, size * 0.05);
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

function contentBox(width: number, height: number) {
  const contentW = Math.min(672, width * 0.78);
  const x = (width - contentW) / 2;
  const y = height * 0.26;
  return { x, y, w: contentW };
}

function fitFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  font: string,
  maxWidth: number,
  startSize: number,
  minSize: number,
) {
  let size = startSize;
  while (size > minSize) {
    ctx.font = `${size}px ${font}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  return size;
}

export function drawHeroLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fonts: LayoutFonts,
) {
  const { identity, metrics } = resume;
  const { x, y, w } = contentBox(width, height);

  const labelSize = Math.max(11, width * 0.013);
  drawStrokedText(
    ctx,
    identity.location.toUpperCase(),
    x,
    y,
    fonts.mono,
    labelSize,
  );

  const headline = identity.headline.join(" ");
  const headSize = fitFontSize(ctx, headline, fonts.mono, w, width * 0.09, 28);
  const headY = y + labelSize * 3.2;
  drawStrokedText(ctx, headline, x, headY, fonts.mono, headSize);

  const tagSize = Math.max(14, width * 0.017);
  const tagY = headY + headSize * 1.15;
  drawStrokedText(ctx, identity.tagline, x, tagY, fonts.sans, tagSize);

  const metricSize = Math.max(11, width * 0.012);
  let metricY = tagY + tagSize * 2.8;
  let metricX = x;

  for (const metric of metrics) {
    const line = `${metric.value}${metric.suffix ?? ""} ${metric.label}`;
    ctx.font = `${metricSize}px ${fonts.mono}`;
    const lineW = ctx.measureText(line).width + 28;

    if (metricX + lineW > x + w) {
      metricX = x;
      metricY += metricSize * 1.8;
    }

    drawStrokedText(ctx, line, metricX, metricY, fonts.mono, metricSize);
    metricX += lineW;
  }
}

export function drawCompaniesLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fonts: LayoutFonts,
) {
  const { companies } = resume;
  const { x, y, w } = contentBox(width, height);

  const labelSize = Math.max(11, width * 0.013);
  drawStrokedText(ctx, "COMPANIES", x, y, fonts.mono, labelSize);

  let cursorY = y + labelSize * 3.2;
  const nameSize = Math.max(20, width * 0.028);
  const aboutSize = Math.max(12, width * 0.014);

  for (const company of companies) {
    const name = fitFontSize(ctx, company.name, fonts.mono, w, nameSize, 16);
    drawStrokedText(ctx, company.name, x, cursorY, fonts.mono, name);
    cursorY += name * 1.2;

    const about = fitFontSize(ctx, company.about, fonts.sans, w, aboutSize, 10);
    drawStrokedText(ctx, company.about, x, cursorY, fonts.sans, about);
    cursorY += about * 1.8;
  }
}

export function drawSkillsLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fonts: LayoutFonts,
) {
  const { skills } = resume;
  const { x, y, w } = contentBox(width, height);

  const labelSize = Math.max(11, width * 0.013);
  drawStrokedText(ctx, "SKILLS", x, y, fonts.mono, labelSize);

  const skillSize = Math.max(13, width * 0.015);
  let cursorX = x;
  let cursorY = y + labelSize * 3.4;

  for (const skill of skills) {
    ctx.font = `${skillSize}px ${fonts.mono}`;
    const chip = skill;
    const chipW = ctx.measureText(chip).width + 24;

    if (cursorX + chipW > x + w) {
      cursorX = x;
      cursorY += skillSize * 2;
    }

    drawStrokedText(ctx, chip, cursorX, cursorY, fonts.mono, skillSize);
    cursorX += chipW;
  }
}

export function drawContactLayout(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  fonts: LayoutFonts,
) {
  const { identity } = resume;
  const { x, y, w } = contentBox(width, height);

  const labelSize = Math.max(11, width * 0.013);
  drawStrokedText(ctx, "CONTACT", x, y, fonts.mono, labelSize);

  const titleSize = fitFontSize(ctx, "Let's talk.", fonts.mono, w, width * 0.05, 24);
  drawStrokedText(ctx, "Let's talk.", x, y + labelSize * 3.2, fonts.mono, titleSize);

  const emailSize = Math.max(14, width * 0.016);
  drawStrokedText(
    ctx,
    identity.email,
    x,
    y + labelSize * 3.2 + titleSize * 1.4,
    fonts.mono,
    emailSize,
  );

  const linkSize = Math.max(12, width * 0.013);
  const links = identity.links.map((l) => l.label).join("   ·   ");
  drawStrokedText(
    ctx,
    links,
    x,
    y + labelSize * 3.2 + titleSize * 1.4 + emailSize * 1.8,
    fonts.mono,
    linkSize,
  );
}

export const PORTFOLIO_SLIDES = [
  { id: "hero", label: "Hero", render: drawHeroLayout },
  { id: "companies", label: "Companies", render: drawCompaniesLayout },
  { id: "skills", label: "Skills", render: drawSkillsLayout },
  { id: "contact", label: "Contact", render: drawContactLayout },
] as const;
