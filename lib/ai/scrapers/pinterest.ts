export type Pin = {
  id: string;
  title: string;
  image: string;
  link: string | null;
  colors: string[];
  source: "pinterest" | "ddg";
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

type PinterestResource = {
  resource_response?: {
    data?: {
      results?: Array<{
        id?: string;
        description?: string | null;
        title?: string | null;
        grid_title?: string | null;
        link?: string | null;
        dominant_color?: string | null;
        images?: {
          orig?: { url?: string };
          "736x"?: { url?: string };
          "474x"?: { url?: string };
        };
      }>;
    };
  };
};

export async function searchPinterest(query: string, limit = 8): Promise<Pin[]> {
  const data = {
    options: { query, scope: "pins", page_size: Math.min(limit, 25) },
    context: {},
  };
  const url =
    "https://www.pinterest.com/resource/BaseSearchResource/get/" +
    "?source_url=" +
    encodeURIComponent(`/search/pins/?q=${encodeURIComponent(query)}&rs=typed`) +
    "&data=" +
    encodeURIComponent(JSON.stringify(data)) +
    "&_=" +
    Date.now();

  const res = await fetch(url, {
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent": UA,
      "X-Pinterest-AppState": "active",
      "X-Requested-With": "XMLHttpRequest",
      Referer: `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`pinterest ${res.status}`);
  const json = (await res.json()) as PinterestResource;
  const results = json.resource_response?.data?.results ?? [];

  const pins: Pin[] = [];
  for (const r of results) {
    const img =
      r.images?.orig?.url ??
      r.images?.["736x"]?.url ??
      r.images?.["474x"]?.url;
    if (!img || !r.id) continue;
    pins.push({
      id: r.id,
      title: (r.grid_title || r.title || r.description || "").trim().slice(0, 140),
      image: img,
      link: r.link ?? null,
      colors: r.dominant_color ? [r.dominant_color] : [],
      source: "pinterest",
    });
    if (pins.length >= limit) break;
  }
  return pins;
}
