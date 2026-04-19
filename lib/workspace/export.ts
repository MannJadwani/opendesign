"use client";

import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

function safeName(title: string | undefined) {
  const base = (title ?? "artifact").trim().toLowerCase();
  return base.replace(/[^a-z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "artifact";
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportHtml(html: string, title?: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  download(blob, `${safeName(title)}.html`);
}

async function rasterize(iframe: HTMLIFrameElement) {
  const doc = iframe.contentDocument;
  if (!doc) throw new Error("iframe has no document");
  const target = doc.documentElement;
  const width = Math.max(target.scrollWidth, doc.body.scrollWidth, iframe.clientWidth);
  const height = Math.max(target.scrollHeight, doc.body.scrollHeight);
  return html2canvas(target, {
    backgroundColor: "#ffffff",
    width,
    height,
    windowWidth: width,
    windowHeight: height,
    scale: Math.min(2, window.devicePixelRatio || 1),
    useCORS: true,
    allowTaint: true,
    logging: false,
  });
}

export async function exportPng(iframe: HTMLIFrameElement, title?: string) {
  const canvas = await rasterize(iframe);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("png encode failed");
  download(blob, `${safeName(title)}.png`);
}

export async function exportPdf(iframe: HTMLIFrameElement, title?: string) {
  const canvas = await rasterize(iframe);
  const imgData = canvas.toDataURL("image/png");
  const orientation = canvas.width >= canvas.height ? "landscape" : "portrait";
  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: [canvas.width, canvas.height],
    compress: true,
  });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
  pdf.save(`${safeName(title)}.pdf`);
}
