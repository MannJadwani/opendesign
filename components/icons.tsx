import type { SVGProps } from "react";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 14, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...stroke} {...rest}>
      {children}
    </svg>
  );
}

export function IconHome(p: IconProps) {
  return (
    <Svg size={16} {...p}>
      <path d="M3 11 12 3l9 8v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2v-9Z" />
    </Svg>
  );
}
export function IconSearch(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Svg>
  );
}
export function IconGrid(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </Svg>
  );
}
export function IconImage(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="m3 17 5-5 4 4 3-3 6 6" />
    </Svg>
  );
}
export function IconEye(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}
export function IconSpark(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <path d="m12 3 2.6 6 6.4.6-5 4.4 1.5 6.4L12 17l-5.5 3.4L8 14 3 9.6 9.4 9 12 3Z" />
    </Svg>
  );
}
export function IconPalette(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <path d="M12 3a9 9 0 1 0 0 18c1.3 0 2-.9 2-2a2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 9 9 0 0 0-10-10Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10.5" r="1" />
    </Svg>
  );
}
export function IconLayout(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </Svg>
  );
}
export function IconDot() {
  return <span className="h-1.5 w-1.5 rounded-full bg-current" />;
}
export function IconExpand(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <path d="M4 10V4h6M20 14v6h-6M4 4l7 7M20 20l-7-7" />
    </Svg>
  );
}
export function IconShrink(p: IconProps) {
  return (
    <Svg size={12} strokeWidth={2} {...p}>
      <path d="M10 4v6H4M14 20v-6h6M10 10 4 4M14 14l6 6" />
    </Svg>
  );
}
export function IconTrash(p: IconProps) {
  return (
    <Svg size={14} {...p}>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6h12Z" />
      <path d="M10 11v6M14 11v6" />
    </Svg>
  );
}
export function IconChevronRight(p: IconProps) {
  return (
    <svg width={p.size ?? 10} height={p.size ?? 10} viewBox="0 0 20 20" {...p}>
      <path d="M7 4l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
