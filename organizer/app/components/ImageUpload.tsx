'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange?: (url: string) => void;
  onFileSelect: (file: File) => void;
  required?: boolean;
  enableOCR?: boolean;
  documentType?: 'businessLicense' | 'vehicleInspection' | 'automobileInspection' | 'plInsurance';
  onRecognized?: (data: any) => void;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onFileSelect,
  required = false,
  enableOCR = false,
  documentType,
  onRecognized,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // プレビュー表示
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileSelect(file);
  };

  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-orange-50 hover:bg-gray-100 transition-colors">
        {preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-52 mx-auto mb-3 rounded"
            />
            <div>
              <label className="inline-block">
                <Button
                  type="button"
                  className="bg-store hover:bg-store-dark"
                  disabled={uploading}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`file-input-${label}`)?.click();
                  }}
                >
                  画像を変更
                </Button>
                <input
                  id={`file-input-${label}`}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <div className="text-sm text-gray-600 mb-3">
              画像を選択
            </div>
            <div className="text-xs text-gray-400">
              JPG, PNG, GIF (最大 5MB)
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {uploading && (
        <div className="mt-3 text-sm text-gray-600">
          アップロード中...
        </div>
      )}
    </div>
  );
}