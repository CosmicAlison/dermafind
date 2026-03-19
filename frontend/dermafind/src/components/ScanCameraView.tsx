import { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';

interface ScanCameraViewProps {
  onUpload: (file: File) => void;
}

export function ScanCameraView({ onUpload }: ScanCameraViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const webcamRef = useRef<Webcam>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }

  const handleCapture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (!screenshot) return;
    fetch(screenshot)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        onUpload(file);
      });
  }, [onUpload]);

  return (
    <>
      {/* Viewfinder */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        background: '#060610',
        position: 'relative',
      }}>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user' }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Corner guides overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CornerFrame />
        </div>

        {/* Label */}
        <div style={{
          position: 'absolute', bottom: 16, left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 12, color: 'rgba(255,255,255,0.6)',
            background: 'rgba(0,0,0,0.4)',
            padding: '4px 12px', borderRadius: 999,
            backdropFilter: 'blur(4px)',
          }}>
            Position face in frame
          </span>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', marginTop: 14 }}>
        For best results ensure your face is well lit and in frame
      </p>

      {/* Controls */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', gap: 32,
        marginTop: 24, width: '100%',
      }}>
        {/* Upload button */}
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-secondary"
          style={{ width: 'auto' }}
        >
          Upload
        </button>

        {/* Capture button */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <button
            onClick={handleCapture}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'var(--grad)',
              border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'transform 0.2s, opacity 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseDown={e  => (e.currentTarget.style.transform = 'scale(0.94)')}
            onMouseUp={e   => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            </svg>
          </button>
        </div>

        {/* Spacer */}
        <div style={{ width: 68 }} />
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </>
  );
}

function CornerFrame() {
  const corner: React.CSSProperties = {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: 'rgba(255,255,255,0.7)',
    borderStyle: 'solid',
  };
  return (
    <div style={{
      width: '60%', aspectRatio: '1',
      position: 'relative', borderRadius: 8,
      border: '1.5px solid rgba(255,255,255,0.2)',
    }}>
      <div style={{ ...corner, top: -2,    left: -2,   borderWidth: '3px 0 0 3px', borderRadius: '5px 0 0 0' }} />
      <div style={{ ...corner, top: -2,    right: -2,  borderWidth: '3px 3px 0 0', borderRadius: '0 5px 0 0' }} />
      <div style={{ ...corner, bottom: -2, left: -2,   borderWidth: '0 0 3px 3px', borderRadius: '0 0 0 5px' }} />
      <div style={{ ...corner, bottom: -2, right: -2,  borderWidth: '0 3px 3px 0', borderRadius: '0 0 5px 0' }} />
    </div>
  );
}