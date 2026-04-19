"use client";

// Apply a map of { data-cd-id → new innerHTML } to an artifact HTML string.
// Uses DOMParser so the edits stay anchored even when element order changes.

export type EditMap = Map<string, string>;

export function applyEdits(html: string, edits: EditMap): string {
  if (edits.size === 0) return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  for (const [id, innerHTML] of edits) {
    const el = doc.querySelector(`[data-cd-id="${cssEscape(id)}"]`);
    if (el) el.innerHTML = innerHTML;
  }
  const head = doc.head.innerHTML;
  const body = doc.body.innerHTML;
  const doctype = doc.doctype
    ? `<!DOCTYPE ${doc.doctype.name}>`
    : "<!DOCTYPE html>";
  const htmlAttrs = serializeAttrs(doc.documentElement);
  const bodyAttrs = serializeAttrs(doc.body);
  return `${doctype}\n<html${htmlAttrs}><head>${head}</head><body${bodyAttrs}>${body}</body></html>`;
}

function serializeAttrs(el: Element): string {
  if (!el.attributes.length) return "";
  const parts: string[] = [];
  for (const attr of Array.from(el.attributes)) {
    parts.push(`${attr.name}="${attr.value.replace(/"/g, "&quot;")}"`);
  }
  return " " + parts.join(" ");
}

function cssEscape(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/[^a-zA-Z0-9_-]/g, (c) => `\\${c}`);
}
