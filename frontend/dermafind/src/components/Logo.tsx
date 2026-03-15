import { Diamond } from './Diamond';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const fontSizes = { sm: '20px', md: '26px', lg: '42px' };
const iconSizes  = { sm: 20,    md: 26,    lg: 46     };

export function Logo({ size = 'md', showIcon = true }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {showIcon && <Diamond size={iconSizes[size]} opacity={0.9} />}
      <span
        className="grad-text"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: fontSizes[size],
          fontWeight: 600,
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        DermaFind
      </span>
    </div>
  );
}
