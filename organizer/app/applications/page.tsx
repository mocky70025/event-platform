'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ApplicationsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  useEffect(() => {
    if (!eventId) {
      // eventIdがない場合はイベント一覧に戻る
      router.push('/events');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationsPageContent />
    </Suspense>
  );
}