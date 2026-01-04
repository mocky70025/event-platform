'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Loader2, AlertCircle } from 'lucide-react';

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

      // JSON文字列のクリーニングとパース
      let parsedData = result.data;
      if (result.data && typeof result.data.text === 'string') {
        try {
          // Markdownコードブロックの除去
          const jsonString = result.data.text
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '');
          
          parsedData = JSON.parse(jsonString);
        } catch (e) {
          console.error('JSON parse error:', e);
          // パース失敗時はそのまま渡す
        }
      }

      setRecognizedData(parsedData);
      onRecognized(parsedData);
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
    <div className="mt-3">
      <Button
        onClick={handleRecognize}
        disabled={recognizing || !imageUrl}
        className="h-9 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-lg px-4 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {recognizing ? (
          <>
            <span>認識中...</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            <Search className="h-4 w-4" />
            <span>{getDocumentTypeLabel()}を認識</span>
          </>
        )}
      </Button>

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}