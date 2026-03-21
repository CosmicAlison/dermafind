import { useEffect, useRef, useCallback } from 'react';
import type { ScanResult } from '../types';

interface ScanResultViewProps {
  result:        ScanResult;
  imageUrl:      string | null;
  severityLabel: string;
  onNewScan:     () => void;
}

const SEVERITY_COLOURS: Record<number, { bg: string; text: string }> = {
  0: { bg: 'rgba(52,199,89,0.12)',   text: '#34C759' },
  1: { bg: 'rgba(52,199,89,0.12)',   text: '#34C759' },
  2: { bg: 'rgba(255,159,10,0.12)',  text: '#FF9F0A' },
  3: { bg: 'rgba(255,69,58,0.12)',   text: '#FF453A' },
  4: { bg: 'rgba(255,69,58,0.12)',   text: '#FF453A' },
};

const LESION_LABELS: Array<{ key: keyof ScanResult; label: string }> = [
  { key: 'blackhead', label: 'Blackhead' },
  { key: 'darkspot',  label: 'Dark Spot'  },
  { key: 'papule',    label: 'Papule'     },
  { key: 'pustule',   label: 'Pustule'    },
  { key: 'whitehead', label: 'Whitehead'  },
  { key: 'nodule',    label: 'Nodule'     },
];

export function ScanResultView({ result, imageUrl, severityLabel, onNewScan }: ScanResultViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef    = useRef<HTMLImageElement>(null);

  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !result.boxes?.length) return;
    const { width, height } = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    result.boxes.forEach(box => {
      const x = box.x * width;
      const y = box.y * height;
      const w = box.w * width;
      const h = box.h * height;

      ctx.fillStyle = 'rgba(91,79,196,0.12)';
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = 'rgba(155,107,181,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      const label = `${box.label}  ${Math.round(box.conf * 100)}%`;
      ctx.font = '600 12px DM Sans, sans-serif';
      const tw    = ctx.measureText(label).width;
      const pillH = 22;
      const pillW = tw + 14;

      ctx.fillStyle = 'rgba(91,79,196,0.92)';
      roundRect(ctx, x, y - pillH - 2, pillW, pillH, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 7, y - pillH - 2 + 14);
    });
  }, [result.boxes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawBoxes();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawBoxes]);

  const colour = SEVERITY_COLOURS[result.result] ?? SEVERITY_COLOURS[0];
  const totalLesions = LESION_LABELS.reduce((sum, { key }) => sum + (result[key] as number), 0);

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Image + bounding boxes */}
      <div style={{
        width: '100%', aspectRatio: '3/4',
        borderRadius: 'var(--r)', overflow: 'hidden',
        position: 'relative', background: '#060610',
      }}>
        {imageUrl && (
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Scan"
            onLoad={() => {
              const c = canvasRef.current;
              if (c) { c.width = c.offsetWidth; c.height = c.offsetHeight; drawBoxes(); }
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
      </div>

      {/* Result card */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '20px 22px',
        marginTop: 16,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>
            {severityLabel} Acne
          </h3>
          <div style={{
            background: colour.bg, color: colour.text,
            fontSize: 12, padding: '5px 12px',
            borderRadius: 20, fontWeight: 500,
            whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            Grade {result.result}
          </div>
        </div>

        {/* Lesion breakdown */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10, marginTop: 16,
        }}>
          {LESION_LABELS.map(({ key, label }) => {
            const count = result[key] as number;
            return (
              <div key={key} style={{
                background: 'var(--dark)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: '10px 12px',
                opacity: count === 0 ? 0.4 : 1,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{label}</div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 14 }}>
          {totalLesions} total lesions detected · {result.boxes?.length ?? 0} annotated
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn-primary" onClick={onNewScan} style={{ flex: 1 }}>
          New Scan
        </button>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}