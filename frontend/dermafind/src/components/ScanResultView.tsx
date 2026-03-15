import { useEffect, useRef, useCallback } from 'react';
import type { ScanResult } from '../types';

interface ScanResultViewProps {
  result: ScanResult;
  imageUrl: string | null;
  onNewScan: () => void;
}

export function ScanResultView({ result, imageUrl, onNewScan }: ScanResultViewProps) {
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

      // Fill
      ctx.fillStyle = 'rgba(91,79,196,0.12)';
      ctx.fillRect(x, y, w, h);

      // Dashed stroke
      ctx.strokeStyle = 'rgba(155,107,181,0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.strokeRect(x, y, w, h);
      ctx.setLineDash([]);

      // Label pill
      const label = `${box.label}  ${Math.round(box.conf * 100)}%`;
      ctx.font = '600 12px DM Sans, sans-serif';
      const tw = ctx.measureText(label).width;
      const pillH = 22;
      const pillW = tw + 14;

      ctx.fillStyle = 'rgba(91,79,196,0.92)';
      roundRect(ctx, x, y - pillH - 2, pillW, pillH, 4);
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.fillText(label, x + 7, y - pillH - 2 + 14);
    });
  }, [result.boxes]);

  // Sync canvas dimensions to its rendered size, then draw
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

  return (
    <div className="fade-in" style={{ width: '100%' }}>
      {/* Image + bounding boxes */}
      <div style={{
        width: '100%', aspectRatio: '3/4',
        borderRadius: 'var(--r)', overflow: 'hidden',
        position: 'relative', background: '#060610',
      }}>
        {imageUrl ? (
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
        ) : (
          /* Demo placeholder */
          <DemoPlaceholder />
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600 }}>
            {result.diagnosis}
          </h3>
          <div style={{
            background: 'rgba(52,199,89,0.12)',
            color: '#34C759',
            fontSize: 12,
            padding: '5px 12px',
            borderRadius: 20,
            fontWeight: 500,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {result.confidence}% match
          </div>
        </div>

        <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.65, marginTop: 8 }}>
          {result.description}
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {result.tags?.map((tag, i) => (
            <div key={i} style={{
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: 20,
              border: `1px solid ${i < 2 ? 'rgba(91,79,196,0.4)' : 'var(--border)'}`,
              background: i < 2 ? 'rgba(91,79,196,0.15)' : 'transparent',
              color: i < 2 ? '#A48FE8' : 'var(--muted)',
            }}>
              {tag}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
        <button className="btn-secondary" onClick={onNewScan} style={{ flex: 1 }}>
          New Scan
        </button>
        <button className="btn-primary" style={{ flex: 1 }}>
          Save to History
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

function DemoPlaceholder() {
  // Visual stand-in when no image file is available (demo capture)
  const box = { x: 0.28, y: 0.22, w: 0.44, h: 0.38, label: 'Seborrheic Keratosis', conf: 0.87 };
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(135deg,#12102a 0%,#1e1535 50%,#130f1c 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Simulated bounding box */}
      <div style={{
        position: 'absolute',
        left: `${box.x * 100}%`, top: `${box.y * 100}%`,
        width: `${box.w * 100}%`, height: `${box.h * 100}%`,
        border: '2px dashed rgba(155,107,181,0.8)',
        background: 'rgba(91,79,196,0.1)',
        borderRadius: 4,
      }}>
        <div style={{
          position: 'absolute', top: -24, left: 0,
          background: 'rgba(91,79,196,0.92)',
          color: '#fff', fontSize: 11, fontWeight: 600,
          padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap',
        }}>
          {box.label}  {Math.round(box.conf * 100)}%
        </div>
      </div>
    </div>
  );
}
