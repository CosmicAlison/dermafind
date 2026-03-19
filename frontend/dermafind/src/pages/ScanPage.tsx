import { useState, useCallback, useRef } from 'react';
import { ScanCameraView }  from '../components/ScanCameraView';
import { ScanLoadingView } from '../components/ScanLoadingView';
import { ScanResultView }  from '../components/ScanResultView';
import { ScanErrorView }   from '../components/ScanErrorView';
import { useAuth }         from '../context/AuthContext';
import type { ScanPhase, ScanResult } from '../types';
import { useApi } from '../useApi';

const SEVERITY_LABELS: Record<number, string> = {
  0: 'Clear',
  1: 'Mild',
  2: 'Moderate',
  3: 'Severe',
  4: 'Very Severe',
};

export function ScanPage() {
  const { getAccessToken } = useAuth();
  const request = useApi();
  const [phase, setPhase]       = useState<ScanPhase>('camera');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult]     = useState<ScanResult | null>(null);
  const fileRef = useRef<File | null>(null);

  function handleUpload(file: File) {
    fileRef.current = file;
    setImageUrl(URL.createObjectURL(file));
    setPhase('loading');
  }

  const handleLoadComplete = useCallback(async (success: boolean) => {
    if (!success || !fileRef.current) { setPhase('error'); return; }

    try {
      const token = await getAccessToken();
      if (!token) { setPhase('error'); return; }

      const formData = new FormData();
      formData.append('image', fileRef.current);
      
      const data = await request<ScanResult>('/inference/scan/detect', {method:'POST', body: formData}); 
      setResult(data);
      setPhase('result');
    } catch {
      setPhase('error');
    }
  }, [getAccessToken]);

  function reset() {
    setPhase('camera');
    setImageUrl(null);
    setResult(null);
    fileRef.current = null;
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '28px 24px',
      margin: '0 auto',
    }} className='md:max-w-[680px] w-100vw'>
      {phase === 'camera' && (
        <>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600,
            marginBottom: 20, width: '100%',
          }}>
            New Scan
          </h2>
          <ScanCameraView onUpload={handleUpload} />
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
          <ScanResultView
            result={result}
            imageUrl={imageUrl}
            onNewScan={reset}
            severityLabel={SEVERITY_LABELS[result.result] ?? 'Unknown'}
          />
        </>
      )}

      {phase === 'error' && (
        <ScanErrorView onRetry={reset} />
      )}
    </div>
  );
}