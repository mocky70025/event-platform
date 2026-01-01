# v0プロンプト：イベント検索・一覧画面

## 📋 プロジェクトコンテキスト

**Tomorrow** - イベント出店者向けプラットフォーム  
**画面**: イベント検索・一覧  
**目的**: 出店者が効率的にイベントを見つけ、比較し、申し込む

---

## 🎯 この画面の目的

1. **効率的な検索**: キーワード、フィルター、ソートで素早く見つける
2. **情報の比較**: 複数イベントを一覧で比較
3. **柔軟な表示**: グリッド/リスト切り替え
4. **アクションの促進**: ワンクリックでお気に入り・申し込み

---

## 🎨 デザインシステム

```css
--color-store: #5DABA8;
--color-store-dark: #4A9693;
--color-store-50: #F0F9F9;
```

---

## 📐 レイアウト

### デスクトップ
```
┌─────────────────────────────────────────────────────────┐
│ 検索バー + フィルターボタン + ソート + ビュー切替       │
├─────────────────────────────────────────────────────────┤
│ アクティブフィルター: [📍東京都 ×] [📅今月 ×]          │
├─────────────────────────────────────────────────────────┤
│ 検索結果: 24件のイベント                                │
│                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│ │イベント1│ │イベント2│ │イベント3│                 │
│ └─────────┘ └─────────┘ └─────────┘                 │
│                                                          │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐                 │
│ │イベント4│ │イベント5│ │イベント6│                 │
│ └─────────┘ └─────────┘ └─────────┘                 │
│                                                          │
├─────────────────────────────────────────────────────────┤
│ ページネーション: < 1 2 3 ... 8 >                       │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 完全実装コード

```tsx
'use client'

import { useState } from 'react'
import {
  Search,
  MapPin,
  Calendar,
  Tag,
  Users,
  DollarSign,
  SlidersHorizontal,
  Grid3x3,
  List,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import EventCard from '@/components/EventCard'
import { cn } from '@/lib/utils'

interface Filter {
  id: string
  type: 'location' | 'date' | 'genre' | 'capacity' | 'fee'
  label: string
  value: string
}

interface SortOption {
  value: string
  label: string
}

const EventSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFilters, setActiveFilters] = useState<Filter[]>([])
  const [sortBy, setSortBy] = useState('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)

  // ダミーイベントデータ
  const events = Array.from({ length: 24 }, (_, i) => ({
    id: `event-${i + 1}`,
    name: `イベント名 ${i + 1}`,
    date: {
      start: '2024-07-15',
      end: '2024-07-16',
      displayText: '2024年7月15日(月) - 16日(火)'
    },
    location: {
      name: '代々木公園',
      prefecture: '東京都'
    },
    capacity: {
      total: 100,
      current: Math.floor(Math.random() * 100),
      remaining: 0
    },
    fee: Math.random() > 0.5 ? 5000 : 0,
    image: `https://images.unsplash.com/photo-${1533174072545 + i}?w=800&h=450&fit=crop`,
    status: ['open', 'closing_soon', 'closed'][Math.floor(Math.random() * 3)] as any,
    tags: ['音楽', '食', 'ファミリー'].slice(0, Math.floor(Math.random() * 3) + 1),
    organizer: {
      name: `主催者${i + 1}`,
      avatar: `https://i.pravatar.cc/150?img=${i + 1}`
    },
    description: 'イベントの説明文がここに入ります...',
    isFavorite: false
  }))

  const sortOptions: SortOption[] = [
    { value: 'date', label: '開催日が近い順' },
    { value: 'date-desc', label: '開催日が遠い順' },
    { value: 'capacity', label: '募集人数が多い順' },
    { value: 'fee', label: '出店料が安い順' },
    { value: 'popular', label: '人気順' }
  ]

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.id !== filterId))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const totalPages = Math.ceil(events.length / 9)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* 検索バー */}
          <div className="flex gap-3 items-center mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="イベント名、場所、キーワードで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent transition-all outline-none text-base"
              />
            </div>
            
            {/* フィルターボタン */}
            <Button
              variant="outline"
              className="flex items-center gap-2 border-2 px-4 py-3 h-auto"
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden md:inline">フィルター</span>
              {activeFilters.length > 0 && (
                <span className="bg-[#5DABA8] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilters.length}
                </span>
              )}
            </Button>
          </div>
          
          {/* フィルター・ソート・ビュー切替 */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            {/* フィルターチップ */}
            <div className="flex gap-2 flex-wrap items-center">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium">
                <MapPin className="w-4 h-4" />
                <span>場所</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium">
                <Calendar className="w-4 h-4" />
                <span>日付</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-300 hover:border-[#5DABA8] rounded-lg transition-all text-sm font-medium">
                <Tag className="w-4 h-4" />
                <span>ジャンル</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
            
            {/* ソート・ビュー切替 */}
            <div className="flex gap-2 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DABA8] focus:border-transparent outline-none text-sm font-medium"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <div className="flex bg-white border-2 border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'grid'
                      ? "bg-[#5DABA8] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "p-2 transition-colors",
                    viewMode === 'list'
                      ? "bg-[#5DABA8] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* アクティブフィルター */}
      {activeFilters.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-sm text-gray-600 font-medium">
                フィルター:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#F0F9F9] text-[#5DABA8] rounded-full text-sm font-semibold"
                >
                  {filter.label}
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="hover:bg-[#5DABA8] hover:text-white rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-[#5DABA8] font-medium transition-colors ml-2"
              >
                すべてクリア
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* 検索結果数 */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            検索結果: {events.length}件のイベント
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            あなたにぴったりのイベントを見つけましょう
          </p>
        </div>
        
        {/* イベント一覧 */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              イベントが見つかりませんでした
            </h3>
            <p className="text-gray-600 mb-6">
              検索条件を変更してみてください
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-[#5DABA8] hover:bg-[#4A9693]"
            >
              フィルターをクリア
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "mb-8",
              viewMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            )}
          >
            {events.slice((currentPage - 1) * 9, currentPage * 9).map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onFavoriteToggle={(id) => console.log('Toggle favorite:', id)}
                onApply={(id) => console.log('Apply:', id)}
                onViewDetail={(id) => console.log('View detail:', id)}
              />
            ))}
          </div>
        )}
        
        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border-2 border-gray-300 hover:border-[#5DABA8] hover:bg-[#F0F9F9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // 最初、最後、現在ページ周辺のみ表示
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all",
                      page === currentPage
                        ? "bg-[#5DABA8] text-white shadow-md"
                        : "bg-white border-2 border-gray-300 hover:border-[#5DABA8] hover:bg-[#F0F9F9]"
                    )}
                  >
                    {page}
                  </button>
                )
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return <span key={page} className="px-2 text-gray-500">...</span>
              }
              return null
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border-2 border-gray-300 hover:border-[#5DABA8] hover:bg-[#F0F9F9] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
      
      {/* フィルターパネル（モーダル）※オプション */}
      {isFilterPanelOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">フィルター</h2>
              <button
                onClick={() => setIsFilterPanelOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* フィルター内容（実装省略） */}
              <div>
                <h3 className="font-semibold mb-3">場所</h3>
                {/* チェックボックス等 */}
              </div>
              
              <div>
                <h3 className="font-semibold mb-3">日付</h3>
                {/* 日付ピッカー等 */}
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearAllFilters}
              >
                クリア
              </Button>
              <Button
                className="flex-1 bg-[#5DABA8] hover:bg-[#4A9693]"
                onClick={() => setIsFilterPanelOpen(false)}
              >
                適用
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventSearchPage
```

---

## 🎬 インタラクション

1. **検索バー**: リアルタイム検索（debounce 300ms）
2. **フィルター**: 選択するとバッジ追加
3. **ソート**: 即座に並び替え
4. **ビュー切替**: スムーズなトランジション
5. **ページネーション**: スムーズなスクロール

---

## 📱 レスポンシブ

- **lg**: 3カラムグリッド
- **md**: 2カラムグリッド
- **sm**: 1カラム

---

## 🎯 最適化

- **Lazy loading**: スクロール時に追加読み込み
- **Virtual scrolling**: 大量データ対応
- **Debounce**: 検索入力を300ms遅延

---

このプロンプトで、使いやすい検索・一覧画面を生成してください！

