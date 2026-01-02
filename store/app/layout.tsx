import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '出店者向けイベントプラットフォーム',
  description: 'イベントに出店するためのプラットフォーム',
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


