interface ScanErrorViewProps {
  onRetry: () => void;
}

export function ScanErrorView({ onRetry }: ScanErrorViewProps) {
  return (
    <div className="fade-in" style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, padding: '48px 24px', textAlign: 'center',
      width: '100%',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: 'rgba(212,115,90,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600 }}>
        Couldn't process your scan
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 290, lineHeight: 1.65 }}>
        The image quality may be too low, or the area wasn't clearly visible.
        Please try again in better lighting.
      </p>

      <button className="btn-primary" onClick={onRetry} style={{ maxWidth: 280 }}>
        Try Again
      </button>
    </div>
  );
}
