'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import LoadingSpinner from './LoadingSpinner';

interface Exhibitor {
  id: string;
  name: string;
  gender: string;
  age: number;
  email: string;
  phone_number: string;
  genre_category?: string;
  created_at: string;
}

export default function ExhibitorManagement() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadExhibitors();
  }, []);

  const loadExhibitors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('exhibitors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExhibitors(data || []);
    } catch (error: any) {
      console.error('Error loading exhibitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExhibitors = exhibitors.filter(exhibitor =>
    exhibitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}>
          出店者管理
        </h2>
        <input
          type="text"
          placeholder="検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '14px',
            width: '200px',
          }}
        />
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#f9fafb',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>名前</th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>性別</th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>年齢</th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>メール</th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>ジャンル</th>
              <th style={{
                padding: '12px',
                textAlign: 'left',
                fontSize: '14px',
                fontWeight: '500',
                color: '#666',
              }}>登録日</th>
            </tr>
          </thead>
          <tbody>
            {filteredExhibitors.map((exhibitor) => (
              <tr
                key={exhibitor.id}
                style={{
                  borderBottom: '1px solid #e5e7eb',
                }}
              >
                <td style={{ padding: '12px', fontSize: '14px' }}>{exhibitor.name}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{exhibitor.gender}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{exhibitor.age}歳</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{exhibitor.email}</td>
                <td style={{ padding: '12px', fontSize: '14px' }}>{exhibitor.genre_category || '-'}</td>
                <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                  {new Date(exhibitor.created_at).toLocaleDateString('ja-JP')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredExhibitors.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999',
          }}>
            {searchTerm ? '検索結果が見つかりませんでした' : '出店者が見つかりませんでした'}
          </div>
        )}
      </div>

      <div style={{
        marginTop: '16px',
        fontSize: '14px',
        color: '#666',
      }}>
        合計: {filteredExhibitors.length}件
      </div>
    </div>
  );
}

