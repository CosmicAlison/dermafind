import { useState, useCallback } from 'react';
import { ScanCameraView }  from '../components/ScanCameraView';
import { ScanLoadingView } from '../components/ScanLoadingView';
import { ScanResultView }  from '../components/ScanResultView';
import { ScanErrorView }   from '../components/ScanErrorView';
import { useAuth }         from '../context/AuthContext';
import type { ScanPhase, ScanResult } from '../index';

// Mock result — replace with real API response shape
const MOCK_RESULT: ScanResult = {
  success: true,
  diagnosis: 'Seborrheic Keratosis',
  confidence: 87,
  description:
    'A benign skin growth that often appears as a brown, black or light tan growth. Typically harmless and requires no treatment.',
  tags: ['Benign', 'Non-melanoma', 'Low priority', 'Monitor annually'],
  boxes: [
    { x: 0.28, y: 0.22, w: 0.44, h: 0.38, label: 'Seborrheic Keratosis', conf: 0.87 },
  ],
};

export function ScanPage() {
  const { refreshAccessToken } = useAuth();
  const [phase, setPhase]       = useState<ScanPhase>('camera');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult]     = useState<ScanResult | null>(null);

  // Called when user taps the shutter (demo — no real camera API)
  function handleCapture() {
    setImageUrl(null); // no file, use placeholder
    setPhase('loading');
  }

  // Called when user uploads a file
  function handleUpload(file: File) {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setPhase('loading');
  }

  // Called by ScanLoadingView when its timer finishes
  // In production: receive the actual API result here instead of the boolean
  const handleLoadComplete = useCallback(async (success: boolean) => {
    if (!success) { setPhase('error'); return; }

    // Example: call your real API
    // const token = await refreshAccessToken();
    // const res   = await fetch('/api/scan', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${token}` },
    //   body: formData,
    // });
    // const data: ScanResult = await res.json();
    // setResult(data);

    setResult(MOCK_RESULT);
    setPhase('result');
  }, [refreshAccessToken]);

  function reset() {
    setPhase('camera');
    setImageUrl(null);
    setResult(null);
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 24px',
      maxWidth: 480,
      margin: '0 auto',
      width: '100%',
    }}>
      {phase === 'camera' && (
        <>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600,
            marginBottom: 20, width: '100%',
          }}>
            New Scan
          </h2>
          <ScanCameraView onCapture={handleCapture} onUpload={handleUpload} />
        </>
      )}

      {phase === 'loading' && (
        <ScanLoadingView onComplete={handleLoadComplete} />
      )}

      {phase === 'result' && result && (
        <>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600,
            marginBottom: 20, width: '100%',
          }}>
            Scan result
          </h2>
          <ScanResultView result={result} imageUrl={imageUrl} onNewScan={reset} />
        </>
      )}

      {phase === 'error' && (
        <ScanErrorView onRetry={reset} />
      )}
    </div>
  );
}
