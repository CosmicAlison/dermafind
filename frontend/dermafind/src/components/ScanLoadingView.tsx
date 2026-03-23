import { useEffect, useState } from 'react';

const STEPS = [
  'Preprocessing image',
  'Running skin analysis',
  'Detecting regions',
  'Generating report',
];

interface ScanLoadingViewProps {
  onComplete: (success: boolean) => void;
}

export function ScanLoadingView({ onComplete }: ScanLoadingViewProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), (i + 1) * 950)
    );
    const done = setTimeout(() => {
      onComplete(Math.random() > 0.2);
    }, STEPS.length * 950 + 500);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [onComplete]);

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 32,
      padding: '40px 24px',
    }} className="fade-in">

      {/* Gradient orb */}
      <div style={{ position: 'relative', width: 128, height: 128 }}>
        {/* Outer ring 2 */}
        <div style={{
          position: 'absolute',
          inset: -18,
          borderRadius: '50%',
          border: '1px solid rgba(155,107,181,0.25)',
          animation: 'spin 6s linear infinite reverse',
        }} />
        {/* Outer ring 1 */}
        <div style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          border: '1.5px solid rgba(91,79,196,0.35)',
          animation: 'spin 3.5s linear infinite',
        }} />
        {/* Core */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: '50%',
          background: 'var(--grad)',
          animation: 'pulse-orb 2s ease-in-out infinite',
        }} />
      </div>

      {/* Text */}
      <div style={{ textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600 }}>
          Analysing your scan
        </h3>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
          Our AI is examining your image
        </p>
      </div>

      {/* Step list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 260 }}>
        {STEPS.map((s, i) => {
          const done   = step > i;
          const active = step === i;
          return (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: done ? 'var(--text)' : 'var(--muted)',
              transition: 'color 0.35s',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: done ? '#34C759' : active ? 'var(--purple)' : 'var(--surface2)',
                animation: active ? 'step-pulse 1s ease-in-out infinite' : 'none',
                transition: 'background 0.35s',
              }} />
              {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}
