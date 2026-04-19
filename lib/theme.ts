export const palette = {
  canvas: "#E8E0D0",
  canvasSoft: "#EDE4D3",
  paper: "#F5F0E8",
  paperHover: "#FAF6EF",
  paperSoft: "#EFE9DC",
  dot: "#E4DED3",
  ink: "#1F1B16",
  inkInk: "#1a1a1a",
  ink70: "#3D3831",
  ink50: "#6B655D",
  ink30: "#9A9389",
  accent: "#D9623A",
  accentStrong: "#C0462A",
  accentSoft: "#FDEFE8",
  accentInk: "#7A2A13",
  accentDeep: "#4A1D0C",
  accentHover: "#A03920",
} as const;

export type PaletteToken = keyof typeof palette;
