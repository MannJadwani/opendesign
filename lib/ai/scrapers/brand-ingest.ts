import { interpretImageUrl, type ImageInterpretation } from "./interpret-image";

export type BrandTokens = {
  palette: string[];
  typography: string;
  layout: string;
  mood: string;
  summary?: string;
  themeColor?: string;
  notes?: string;
  sourceUrl?: string;
  sourceImageUrl?: string;
};

const IMG_LIKELY_HEADERS = ["og:image", "og:image:secure_url", "twitter:image"];

function extractMeta(html: string, name: string): string | null {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']+)["']`,
    "i",
  );
  const m = re.exec(html);
  if (m) return m[1];
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]*(?:property|name)=["']${name}["']`,
    "i",
  );
  const m2 = re2.exec(html);
  return m2 ? m2[1] : null;
}

function absolutize(base: string, href: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractCssVars(html: string): string[] {
  const vars: string[] = [];
  const re = /--[a-z0-9-_]+\s*:\s*(#[0-9a-f]{3,8}|rgb[a]?\([^)]+\)|hsl[a]?\([^)]+\))/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    vars.push(m[1]);
    if (vars.length > 12) break;
  }
  return vars;
}

export async function ingestFromSite(siteUrl: string): Promise<BrandTokens> {
  const res = await fetch(siteUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (compatible; OpenDesignBot/1.0; +https://opendesign.dev)",
    },
  });
  if (!res.ok) throw new Error(`fetch ${res.status}`);
  const html = await res.text();

  const themeColor = extractMeta(html, "theme-color") ?? undefined;
  let ogImage: string | null = null;
  for (const tag of IMG_LIKELY_HEADERS) {
    const v = extractMeta(html, tag);
    if (v) {
      ogImage = absolutize(siteUrl, v);
      break;
    }
  }

  const cssVars = extractCssVars(html);

  let interp: ImageInterpretation | null = null;
  if (ogImage) {
    try {
      interp = await interpretImageUrl(ogImage, "overall");
    } catch {
      interp = null;
    }
  }

  const palette = interp?.palette ?? [];
  // Merge in site-derived colors — theme-color + css var hexes — deduped.
  const extras: string[] = [];
  if (themeColor?.startsWith("#")) extras.push(themeColor);
  for (const v of cssVars) {
    if (v.startsWith("#")) extras.push(v);
  }
  const merged: string[] = [];
  for (const c of [...palette, ...extras]) {
    const norm = c.toLowerCase();
    if (!merged.some((m) => m.toLowerCase() === norm)) merged.push(c);
    if (merged.length >= 8) break;
  }

  return {
    palette: merged,
    typography: interp?.typography ?? "sans, unknown",
    layout: interp?.layout ?? "unknown",
    mood: interp?.mood ?? "",
    summary: interp?.summary,
    themeColor,
    sourceUrl: siteUrl,
    sourceImageUrl: ogImage ?? undefined,
  };
}

export async function ingestFromImage(imageUrl: string): Promise<BrandTokens> {
  const interp = await interpretImageUrl(imageUrl, "overall");
  return {
    palette: interp.palette,
    typography: interp.typography,
    layout: interp.layout,
    mood: interp.mood,
    summary: interp.summary,
    sourceImageUrl: imageUrl,
  };
}

export function brandTokensToPromptSection(tokens: BrandTokens): string {
  const palette = tokens.palette.length
    ? tokens.palette.join(", ")
    : "(none — use tasteful neutrals)";
  const lines = [
    "",
    "# Project brand system (APPLY THIS)",
    "",
    "The user has uploaded a brand reference for this project. Every artifact MUST use these tokens. Do not substitute the generic beige/orange defaults.",
    "",
    `**Palette (use only these, most prominent first):** ${palette}`,
    `**Typography:** ${tokens.typography}`,
    `**Layout posture:** ${tokens.layout}`,
    `**Mood:** ${tokens.mood}`,
  ];
  if (tokens.summary) lines.push(`**Reference summary:** ${tokens.summary}`);
  if (tokens.themeColor) lines.push(`**Site theme-color meta:** ${tokens.themeColor}`);
  if (tokens.sourceUrl) lines.push(`**Source site:** ${tokens.sourceUrl}`);
  lines.push(
    "",
    "Rules: skip Pinterest research when applying a brand system — the brand IS the reference. Still call `synthesize_concept` to state how you're translating the brand into THIS artifact's concept (posture, type pairing) before emitting. If the palette lacks a neutral, use a near-black and near-white derived from the darkest/lightest brand color.",
  );
  return lines.join("\n");
}
