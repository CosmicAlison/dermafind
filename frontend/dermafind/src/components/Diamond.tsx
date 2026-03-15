interface DiamondProps {
  size?: number;
  opacity?: number;
  className?: string;
}

export function Diamond({ size = 40, opacity = 1, className }: DiamondProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      style={{ opacity, display: 'inline-block', flexShrink: 0 }}
    >
      <polygon
        points="20,4 36,14 36,26 20,36 4,26 4,14"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
      />
      <line x1="4"  y1="14" x2="36" y2="14" stroke="white" strokeWidth="1"   />
      <line x1="20" y1="4"  x2="4"  y2="14" stroke="white" strokeWidth="1"   />
      <line x1="20" y1="4"  x2="36" y2="14" stroke="white" strokeWidth="1"   />
      <line x1="4"  y1="14" x2="20" y2="36" stroke="white" strokeWidth="1"   />
      <line x1="36" y1="14" x2="20" y2="36" stroke="white" strokeWidth="1"   />
      <line x1="4"  y1="14" x2="20" y2="20" stroke="white" strokeWidth="0.8" />
      <line x1="36" y1="14" x2="20" y2="20" stroke="white" strokeWidth="0.8" />
      <line x1="20" y1="20" x2="20" y2="36" stroke="white" strokeWidth="0.8" />
    </svg>
  );
}
