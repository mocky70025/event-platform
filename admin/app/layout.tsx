import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '管理者向けイベントプラットフォーム',
  description: 'システム管理者向けの管理画面',
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


