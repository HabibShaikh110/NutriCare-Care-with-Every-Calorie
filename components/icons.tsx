import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps): IconProps {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props,
  };
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 8h3l1.6-2.2h6.8L17 8h3a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a1 1 0 011-1z" />
      <circle cx="12" cy="13.5" r="3.6" />
    </svg>
  );
}

export function PlateIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <circle cx="10" cy="12" r="8" />
      <circle cx="10" cy="12" r="4.4" />
      <path d="M18.5 4.5v15" />
      <path d="M21 4.5v5a2 2 0 01-2 2h-.5" />
    </svg>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M21 12a8 8 0 01-8 8H5.6L3 21l1-3.4A8 8 0 1121 12z" />
      <path d="M8.5 10.5h7M8.5 14h4.5" />
    </svg>
  );
}
