'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (!eventId) {
      // eventIdがない場合はイベント一覧に戻る
      router.push('/events');
    }
  }, [eventId, router]);

  if (!eventId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>申し込み管理ページ (Event ID: {eventId})</p>
      <p>このページは実装中です</p>
    </div>
  );
}