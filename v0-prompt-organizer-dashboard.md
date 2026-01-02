# v0プロンプト：主催者ダッシュボード

## 📋 プロジェクトコンテキスト

**Tomorrow** - イベント主催者向けプラットフォーム  
**対象**: イベント運営会社・団体  
**目的**: イベント管理と出店者審査を効率化

---

## 🎨 デザインシステム（Organizer = 主催者用）

### カラー
```css
--color-organizer: #E58A7B;      /* Primary - コーラルオレンジ */
--color-organizer-dark: #D87564;  /* Primary Dark */
--color-organizer-light: #F0A89E; /* Primary Light */
--color-organizer-50: #FEF5F3;    /* 極薄 */
--color-organizer-100: #FDDDD7;   /* 薄い */
```

---

## 🎯 この画面の目的

1. **イベント管理**: 開催予定・進行中のイベントを一元管理
2. **申し込み審査**: 出店者からの申し込みを効率的に審査
3. **統計把握**: イベント別の応募数・承認率などを可視化
4. **クイックアクション**: よく使う機能へのショートカット

---

## 📐 レイアウト

### デスクトップ
```
┌─────────────────────────────────────────────────────────┐
│ ウェルカムメッセージ + 今週の統計                       │
├─────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │開催中    │ │申込承認待│ │今月の応募│ │承認率    │ │
│ │3イベント │ │ 12件    │ │ 48件    │ │ 85%     │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────┤
│ 🚨 要対応アラート                                        │
│ • 「夏フェス2024」に5件の新規申し込み → 今すぐ審査      │
│ • 「春の食フェス」の募集締切が明日です → 設定変更       │
├─────────────────────────────────────────────────────────┤
│ 📅 イベント管理                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │ [画像] 夏フェス2024                              │     │
│ │ 2024/7/15-16 | 代々木公園                       │     │
│ │ 応募: 45/100 | 承認済み: 38 | 保留中: 7        │     │
│ │ [詳細] [申し込み管理] [編集]                    │     │
│ └────────────────────────────────────────────────┘     │
│                                                          │
│ [他のイベント...]                                        │
├─────────────────────────────────────────────────────────┤
│ 🚀 クイックアクション                                    │
│ [新しいイベントを作成] [申し込みを一括審査]             │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 完全実装コード

```tsx
'use client'

import { useState } from 'react'
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
  Plus,
  Edit,
  FileCheck,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([
    {
      id: '1',
      name: '夏フェス2024',
      date: '2024/7/15-16',
      location: '代々木公園',
      status: 'active',
      capacity: { total: 100, applied: 45, approved: 38, pending: 7 },
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=250'
    },
    {
      id: '2',
      name: '春の食フェス',
      date: '2024/8/10-11',
      location: 'お台場',
      status: 'upcoming',
      capacity: { total: 80, applied: 32, approved: 28, pending: 4 },
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=250'
    }
  ])

  const stats = {
    activeEvents: 3,
    pendingApplications: 12,
    monthlyApplications: 48,
    approvalRate: 85
  }

  const alerts = [
    {
      id: '1',
      type: 'info',
      title: '新規申し込み',
      message: '「夏フェス2024」に5件の新規申し込みがあります',
      action: { label: '今すぐ審査', onClick: () => console.log('Review') }
    },
    {
      id: '2',
      type: 'warning',
      title: '募集締切間近',
      message: '「春の食フェス」の募集締切が明日です',
      action: { label: '設定変更', onClick: () => console.log('Settings') }
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            イベント管理と出店者審査を効率的に
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="開催中のイベント"
            value={stats.activeEvents}
            icon={<Calendar className="w-6 h-6" />}
            gradient="from-blue-400 to-blue-600"
            trend={{ value: 1, direction: 'up' }}
          />
          <StatCard
            title="申込承認待ち"
            value={stats.pendingApplications}
            icon={<Clock className="w-6 h-6" />}
            gradient="from-orange-400 to-orange-600"
            badge="要対応"
          />
          <StatCard
            title="今月の応募数"
            value={stats.monthlyApplications}
            icon={<Users className="w-6 h-6" />}
            gradient="from-purple-400 to-purple-600"
            trend={{ value: 12, direction: 'up', label: '先月比' }}
          />
          <StatCard
            title="承認率"
            value={`${stats.approvalRate}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-green-400 to-green-600"
          />
        </div>

        {/* アラート */}
        {alerts.length > 0 && (
          <div className="space-y-3 mb-8">
            {alerts.map(alert => (
              <AlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        {/* イベント管理セクション */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              イベント管理
            </h2>
            <Button className="bg-[#E58A7B] hover:bg-[#D87564] flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新しいイベントを作成
            </Button>
          </div>

          <div className="space-y-4">
            {events.map(event => (
              <EventManagementCard key={event.id} event={event} />
            ))}
          </div>
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<Plus className="w-6 h-6" />}
            title="新規イベント作成"
            description="新しいイベントを登録"
            gradient="from-blue-400 to-blue-600"
            onClick={() => console.log('Create event')}
          />
          <QuickActionCard
            icon={<FileCheck className="w-6 h-6" />}
            title="申し込み一括審査"
            description="保留中の申し込みを審査"
            gradient="from-orange-400 to-orange-600"
            onClick={() => console.log('Batch review')}
          />
          <QuickActionCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="統計レポート"
            description="詳細な分析を確認"
            gradient="from-purple-400 to-purple-600"
            onClick={() => console.log('Analytics')}
          />
        </div>
      </main>
    </div>
  )
}

// 統計カードコンポーネント
const StatCard = ({ title, value, icon, gradient, trend, badge }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "p-3 rounded-xl bg-gradient-to-br shadow-sm",
          gradient
        )}>
          <div className="text-white">{icon}</div>
        </div>
        {badge && (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            trend.direction === 'up' ? "text-green-600" : "text-red-600"
          )}>
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{trend.value}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600">
        {title}
      </div>
    </CardContent>
  </Card>
)

// アラートバナー
const AlertBanner = ({ alert }) => {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    }
  }

  const config = typeConfig[alert.type]

  return (
    <div className={cn(
      "p-4 rounded-xl border-2 flex items-center gap-4",
      config.bg,
      config.border
    )}>
      <AlertCircle className={cn("w-5 h-5", config.icon)} />
      <div className="flex-1">
        <h3 className="font-semibold mb-1">{alert.title}</h3>
        <p className="text-sm text-gray-700">{alert.message}</p>
      </div>
      {alert.action && (
        <Button
          onClick={alert.action.onClick}
          className={cn("text-white shadow-sm", config.button)}
        >
          {alert.action.label}
        </Button>
      )}
    </div>
  )
}

// イベント管理カード
const EventManagementCard = ({ event }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-0">
      <div className="flex gap-5 p-5">
        {/* イベント画像 */}
        <div className="w-48 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
          <img
            src={event.image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* イベント情報 */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {event.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {event.location}
                </span>
              </div>
            </div>
            <span className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              event.status === 'active' && "bg-green-100 text-green-700",
              event.status === 'upcoming' && "bg-blue-100 text-blue-700"
            )}>
              {event.status === 'active' ? '開催中' : '開催予定'}
            </span>
          </div>

          {/* 応募状況 */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {event.capacity.applied}
              </div>
              <div className="text-xs text-gray-600">応募数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {event.capacity.approved}
              </div>
              <div className="text-xs text-gray-600">承認済み</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {event.capacity.pending}
              </div>
              <div className="text-xs text-gray-600">保留中</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {event.capacity.total}
              </div>
              <div className="text-xs text-gray-600">募集枠</div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              詳細
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-[#E58A7B] hover:bg-[#D87564]"
            >
              申し込み管理
            </Button>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
)

// クイックアクションカード
const QuickActionCard = ({ icon, title, description, gradient, onClick }) => (
  <button
    onClick={onClick}
    className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 text-left group"
  >
    <div className={cn(
      "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4 group-hover:shadow-lg transition-shadow",
      gradient
    )}>
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
)

export default OrganizerDashboard
```

---

## 🎬 アニメーション

- カードホバー: `hover:-translate-y-0.5 transition-all`
- 統計カード: `hover:shadow-md transition-shadow`
- ボタン: `transition-colors duration-200`

---

## 📱 レスポンシブ

- **lg**: 4カラムグリッド（統計）
- **md**: 2カラム
- **sm**: 1カラム（縦積み）

---

## 🎯 出店者アプリとの違い

1. **カラー**: オレンジ系（#E58A7B）
2. **機能**: 審査・管理中心
3. **統計**: イベント運営視点
4. **アクション**: イベント作成・申し込み審査

---

このプロンプトで、主催者向けの効率的なダッシュボードを生成してください！


