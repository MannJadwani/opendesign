export function rid(prefix: string) {
  return prefix + "_" + crypto.randomUUID().replace(/-/g, "").slice(0, 20);
}
