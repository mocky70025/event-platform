'use client';

import { useState } from 'react';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  onFileSelect: (file: File) => void;
  required?: boolean;
}

export default function ImageUpload({
  label,
  value,
  onChange,
  onFileSelect,
  required = false,
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
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#333',
      }}>
        {label}
        {required && <span style={{ color: '#e74c3c' }}> *</span>}
      </label>
      <div style={{
        border: '2px dashed #ccc',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
      }}>
        {preview ? (
          <div>
            <img
              src={preview}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                marginBottom: '10px',
                borderRadius: '4px',
              }}
            />
            <div>
              <label style={{
                display: 'inline-block',
                padding: '8px 16px',
                backgroundColor: '#FF6B35',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}>
                画像を変更
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        ) : (
          <label style={{
            display: 'block',
            cursor: 'pointer',
          }}>
            <div style={{
              fontSize: '48px',
              color: '#999',
              marginBottom: '10px',
            }}>📷</div>
            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '10px',
            }}>
              画像を選択
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999',
            }}>
              JPG, PNG, GIF (最大 5MB)
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {uploading && (
        <div style={{
          marginTop: '10px',
          fontSize: '14px',
          color: '#666',
        }}>
          アップロード中...
        </div>
      )}
    </div>
  );
}

