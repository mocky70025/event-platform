'use client';

import { useState } from 'react';

interface DocumentRecognizerProps {
  imageUrl: string;
  documentType: 'businessLicense' | 'vehicleInspection' | 'automobileInspection' | 'plInsurance';
  onRecognized: (data: any) => void;
}

export default function DocumentRecognizer({
  imageUrl,
  documentType,
  onRecognized,
}: DocumentRecognizerProps) {
  const [recognizing, setRecognizing] = useState(false);
  const [recognizedData, setRecognizedData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleRecognize = async () => {
    if (!imageUrl) {
      setError('画像が選択されていません');
      return;
    }

    setRecognizing(true);
    setError('');
    setRecognizedData(null);

    try {
      const response = await fetch('/api/ocr/recognize-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          documentType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '認識に失敗しました');
      }

      setRecognizedData(result.data);
      onRecognized(result.data);
    } catch (err: any) {
      setError(err.message || '画像認識に失敗しました');
    } finally {
      setRecognizing(false);
    }
  };

  const getDocumentTypeLabel = () => {
    const labels: Record<string, string> = {
      businessLicense: '営業許可証',
      vehicleInspection: '車検証',
      automobileInspection: '自賠責保険',
      plInsurance: 'PL保険',
    };
    return labels[documentType] || '書類';
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <button
        onClick={handleRecognize}
        disabled={recognizing || !imageUrl}
        style={{
          padding: '8px 16px',
          backgroundColor: recognizing ? '#ccc' : '#5DABA8',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          cursor: recognizing || !imageUrl ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {recognizing ? (
          <>
            <span>認識中...</span>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid #fff',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          </>
        ) : (
          <>
            <span>🔍</span>
            <span>{getDocumentTypeLabel()}を認識</span>
          </>
        )}
      </button>

      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          fontSize: '12px',
        }}>
          {error}
        </div>
      )}

      {recognizedData && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '8px',
          }}>
            認識結果:
          </div>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '12px',
            margin: 0,
          }}>
            {JSON.stringify(recognizedData, null, 2)}
          </pre>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

