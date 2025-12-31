import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '主催者向けイベントプラットフォーム',
  description: 'イベントを主催するためのプラットフォーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}

