# v0プロンプト：イベントカード（改善版）

## 📋 プロジェクトコンテキスト

**Tomorrow** - イベント出店者向けプラットフォーム  
**コンポーネント**: イベントカード  
**目的**: ユーザーが一目でイベント情報を理解し、アクションを起こせるようにする

---

## 🎯 このコンポーネントの目的

1. **情報の明確化**: 重要情報（日付、場所、募集状況）を一目で
2. **魅力の伝達**: 画像とグラデーションで雰囲気を伝える
3. **アクションの促進**: 「詳細を見る」「申し込む」を明確に
4. **ステータスの可視化**: 募集中/終了を視覚的に

---

## 🎨 デザインシステム

### カラー
```css
--color-store: #5DABA8;
--color-store-dark: #4A9693;
--color-store-light: #7FCAC5;
--color-store-50: #F0F9F9;

/* ステータスカラー */
--color-open: #10B981 (緑 - 募集中)
--color-closing: #F59E0B (オレンジ - 締切間近)
--color-closed: #6B7280 (グレー - 募集終了)
```

---

## 📐 レイアウト

```
┌─────────────────────────────────────┐
│ [画像エリア - 16:9]                  │
│  ┌─────────────────────────────┐    │
│  │ グラデーションオーバーレイ   │    │
│  │ [❤️お気に入り]  [📌ステータス]│    │
│  │                              │    │
│  │ イベント名（画像下部）       │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│ コンテンツエリア                     │
│                                      │
│ 📅 2024/7/15-16                     │
│ 📍 代々木公園                        │
│ 👥 募集: 45/100                      │
│ 💰 出店料: 5,000円                   │
│                                      │
│ [🏷️音楽] [🏷️食] [🏷️+2]            │
│                                      │
│ 都内最大級の夏イベント。音楽ライブ...│
│                                      │
│ ┌──────┐                            │
│ │[画像]│ イベント企画株式会社        │
│ └──────┘ 主催者                     │
│                                      │
│ [詳細を見る] [今すぐ申し込む]       │
└─────────────────────────────────────┘
```

---

## 🧩 完全実装コード

```tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Heart,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: {
    id: string
    name: string
    date: {
      start: string
      end: string
      displayText: string
    }
    location: {
      name: string
      address?: string
      prefecture: string
    }
    capacity: {
      total: number
      current: number
      remaining: number
    }
    fee?: number
    image: string
    status: 'open' | 'closing_soon' | 'closed'
    tags: string[]
    organizer: {
      name: string
      avatar?: string
    }
    description: string
    isFavorite?: boolean
  }
  onFavoriteToggle?: (id: string) => void
  onApply?: (id: string) => void
  onViewDetail?: (id: string) => void
}

const EventCard = ({
  event,
  onFavoriteToggle,
  onApply,
  onViewDetail
}: EventCardProps) => {
  const [isFavorited, setIsFavorited] = useState(event.isFavorite || false)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
    onFavoriteToggle?.(event.id)
  }

  const handleCardClick = () => {
    onViewDetail?.(event.id)
  }

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onApply?.(event.id)
  }

  // ステータス設定
  const statusConfig = {
    open: {
      label: '募集中',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: <CheckCircle className="w-3.5 h-3.5" />
    },
    closing_soon: {
      label: '締切間近',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    closed: {
      label: '募集終了',
      bgColor: 'bg-gray-500',
      textColor: 'text-white',
      icon: <XCircle className="w-3.5 h-3.5" />
    }
  }

  const status = statusConfig[event.status]

  // 残席率
  const capacityRate = event.capacity.current / event.capacity.total
  const isAlmostFull = capacityRate > 0.8

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* 画像エリア */}
      <div className="relative aspect-video overflow-hidden bg-gray-200">
        <Image
          src={event.image}
          alt={event.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* グラデーションオーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        
        {/* ステータスバッジ（右上） */}
        <div className="absolute top-4 right-4 z-10">
          <div
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md shadow-lg",
              status.bgColor,
              status.textColor
            )}
          >
            {status.icon}
            <span>{status.label}</span>
          </div>
        </div>
        
        {/* お気に入りボタン（左上） */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-4 left-4 z-10 p-2.5 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg hover:scale-110"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all",
              isFavorited
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            )}
          />
        </button>
        
        {/* イベント名（画像下部オーバーレイ） */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-lg">
            {event.name}
          </h3>
        </div>
      </div>
      
      {/* コンテンツエリア */}
      <div className="p-5">
        {/* メタ情報 */}
        <div className="space-y-2.5 mb-4">
          {/* 日付 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 flex-shrink-0 text-[#5DABA8]" />
            <span className="font-medium">{event.date.displayText}</span>
          </div>
          
          {/* 場所 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 flex-shrink-0 text-[#5DABA8]" />
            <span className="truncate">{event.location.name}</span>
          </div>
          
          {/* 募集人数 */}
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 flex-shrink-0 text-[#5DABA8]" />
            <span>
              募集: {event.capacity.current}/{event.capacity.total}
              {isAlmostFull && event.status === 'open' && (
                <span className="ml-2 text-orange-600 font-semibold">
                  残りわずか！
                </span>
              )}
            </span>
          </div>
          
          {/* 出店料（オプション） */}
          {event.fee !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <DollarSign className="w-4 h-4 flex-shrink-0 text-[#5DABA8]" />
              <span>{event.fee === 0 ? '無料' : `${event.fee.toLocaleString()}円`}</span>
            </div>
          )}
        </div>
        
        {/* タグ */}
        <div className="flex gap-2 flex-wrap mb-4">
          {event.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-[#F0F9F9] text-[#5DABA8] text-xs font-semibold rounded-full hover:bg-[#D1EFED] transition-colors"
            >
              {tag}
            </span>
          ))}
          {event.tags.length > 3 && (
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
              +{event.tags.length - 3}
            </span>
          )}
        </div>
        
        {/* 説明文 */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
          {event.description}
        </p>
        
        {/* 主催者情報 */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
            {event.organizer.avatar ? (
              <Image
                src={event.organizer.avatar}
                alt={event.organizer.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#7FCAC5] to-[#5DABA8] text-white font-bold text-sm">
                {event.organizer.name[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">主催</p>
            <p className="text-sm font-semibold text-gray-900 truncate">
              {event.organizer.name}
            </p>
          </div>
        </div>
        
        {/* アクションボタン */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-2 border-gray-300 hover:border-[#5DABA8] hover:bg-[#F0F9F9] hover:text-[#5DABA8] transition-all font-semibold"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetail?.(event.id)
            }}
          >
            詳細を見る
          </Button>
          <Button
            className={cn(
              "flex-1 font-semibold shadow-sm hover:shadow-md transition-all",
              event.status === 'closed'
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                : "bg-[#5DABA8] hover:bg-[#4A9693]"
            )}
            onClick={handleApplyClick}
            disabled={event.status === 'closed'}
          >
            {event.status === 'closed' ? '募集終了' : '今すぐ申し込む'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EventCard

// ダミーデータ例
const sampleEvent = {
  id: '1',
  name: '夏フェス2024 - 都内最大級の夏イベント',
  date: {
    start: '2024-07-15',
    end: '2024-07-16',
    displayText: '2024年7月15日(月) - 16日(火)'
  },
  location: {
    name: '代々木公園イベント広場',
    address: '東京都渋谷区代々木神園町2-1',
    prefecture: '東京都'
  },
  capacity: {
    total: 100,
    current: 85,
    remaining: 15
  },
  fee: 5000,
  image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=450&fit=crop',
  status: 'open' as const,
  tags: ['音楽', '食', 'ファミリー', 'アウトドア'],
  organizer: {
    name: 'イベント企画株式会社',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  description: '都内最大級の夏イベント。音楽ライブ、フードエリア、ワークショップなど盛りだくさん。家族連れから若者まで楽しめるイベントです。',
  isFavorite: false
}
```

---

## 🎬 アニメーション・インタラクション

### ホバー効果
```tsx
// カード全体
hover:-translate-y-1 transition-all duration-300

// 画像
group-hover:scale-105 transition-transform duration-500

// お気に入りボタン
hover:scale-110 transition-all

// タグ
hover:bg-[#D1EFED] transition-colors
```

### トランジション
- **カードホバー**: 300ms（浮き上がり + 影）
- **画像ズーム**: 500ms（ゆっくり）
- **ボタン**: 200ms（即座に反応）

---

## 📱 レスポンシブ

```tsx
// グリッドレイアウト例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {events.map(event => (
    <EventCard key={event.id} event={event} />
  ))}
</div>
```

---

## ♿ アクセシビリティ

1. **alt属性**: すべての画像
2. **aria-label**: お気に入りボタン
3. **keyboard**: tabでフォーカス、Enterでクリック
4. **focus-visible**: キーボードフォーカス時のリング表示

---

## 🎯 バリエーション

### リストビュー版
```tsx
// 横長レイアウト（デスクトップ）
<div className="flex gap-4 bg-white rounded-xl shadow-sm hover:shadow-md p-4">
  <div className="w-48 aspect-video relative">
    {/* 画像 */}
  </div>
  <div className="flex-1">
    {/* コンテンツ */}
  </div>
</div>
```

---

## 📚 参考デザイン

- **Airbnb**: https://airbnb.com (リスティングカード)
- **Eventbrite**: https://eventbrite.com (イベントカード)
- **Peatix**: https://peatix.com (イベント表示)

---

このプロンプトで、魅力的で機能的なイベントカードを生成してください！

