import type { Pin } from "./pinterest";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type DDGResult = {
  image: string;
  thumbnail: string;
  title: string;
  url: string;
};

async function getVqd(query: string): Promise<string> {
  const res = await fetch(
    `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
    {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000),
    },
  );
  if (!res.ok) throw new Error(`ddg html ${res.status}`);
  const html = await res.text();
  const m = html.match(/vqd=["']([^"']+)["']/) ?? html.match(/vqd=([\w-]+)&/);
  if (!m) throw new Error("ddg vqd missing");
  return m[1];
}

export async function searchDdgImages(
  query: string,
  limit = 8,
): Promise<Pin[]> {
  const vqd = await getVqd(query);
  const url =
    `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}` +
    `&vqd=${encodeURIComponent(vqd)}&f=,,,&p=1`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json, text/javascript, */*; q=0.01",
      Referer: "https://duckduckgo.com/",
      "X-Requested-With": "XMLHttpRequest",
    },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`ddg json ${res.status}`);
  const json = (await res.json()) as { results?: DDGResult[] };
  const results = (json.results ?? []).slice(0, limit);
  return results.map((r, i) => ({
    id: `ddg_${i}_${Buffer.from(r.image).toString("base64").slice(0, 12)}`,
    title: (r.title ?? "").trim().slice(0, 140),
    image: r.image,
    link: r.url ?? null,
    colors: [],
    source: "ddg" as const,
  }));
}
