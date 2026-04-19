import { imageSize } from "image-size";

export type FetchedImage = {
  url: string;
  contentType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  aspect: number | null;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const MAX_BYTES = 2_500_000;

export async function fetchImageMeta(url: string): Promise<FetchedImage> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/*,*/*;q=0.8" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`fetch_image ${res.status}`);
  const contentType = res.headers.get("content-type") ?? "application/octet-stream";
  const buf = new Uint8Array(await res.arrayBuffer());
  const bytes = buf.byteLength;
  if (bytes > MAX_BYTES) throw new Error(`image too large: ${bytes}`);

  let width: number | null = null;
  let height: number | null = null;
  try {
    const dims = imageSize(buf);
    width = dims.width ?? null;
    height = dims.height ?? null;
  } catch {
    // unknown format — leave null
  }

  return {
    url,
    contentType,
    bytes,
    width,
    height,
    aspect: width && height ? +(width / height).toFixed(3) : null,
  };
}
