'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Loader } from 'lucide-react';
import { uploadImage } from '@/lib/storage';

interface ImageUploadProps {
  label: string;
  value?: string | null;
  onChange?: (url: string) => void;
  onFileSelect?: (file: File) => void;
  required?: boolean;
  documentType?: string;
  userId?: string;
  onUploadComplete?: (url: string) => void;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onFileSelect,
  required = false,
  documentType,
  userId,
  onUploadComplete,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    if (onFileSelect) {
      onFileSelect(file);
    }

    if (userId && documentType && onUploadComplete) {
      setUploading(true);
      try {
        const timestamp = new Date().getTime();
        const path = `exhibitors/${userId}/${documentType}_${timestamp}`;
        const url = await uploadImage('documents', path, file);
        onUploadComplete(url);
        if (onChange) onChange(url);
      } catch (error) {
        console.error('Upload failed:', error);
        alert('画像のアップロードに失敗しました。');
        setPreview(null);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-5 text-center bg-sky-50 hover:bg-gray-100 transition-colors">
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
                  className="bg-sky-500 hover:bg-sky-600"
                  disabled={uploading}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(`file-input-${label}`)?.click();
                  }}
                >
                  {uploading ? <Loader className="animate-spin mr-2 h-4 w-4" /> : null}
                  {uploading ? 'アップロード中...' : '画像を変更'}
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
    </div>
  );
}