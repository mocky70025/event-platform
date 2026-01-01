# v0プロンプト：出店者ダッシュボード（超詳細版）

このプロンプトをv0に送信して、プロフェッショナルなダッシュボードを生成してください。

---

## 📋 プロジェクトコンテキスト

### サービス概要
**Tomorrow（トゥモロー）** - イベント出店者と主催者をつなぐB2Bプラットフォーム

**対象ユーザー**: イベント出店者
- 個人事業主（ハンドメイド作家、キッチンカー経営者）
- 中小企業（イベントマーケティング担当者）
- 年齢層: 25-50歳
- ITリテラシー: 中程度
- 主な使用デバイス: スマートフォン（70%）、PC（30%）

### ダッシュボードの目的
1. **情報の一元化**: 応募状況、承認状況、今後の予定を一目で把握
2. **次のアクションを促す**: おすすめイベント、重要な通知、クイックアクション
3. **安心感の提供**: 視覚的なステータス表示で不安を解消
4. **効率化**: よく使う機能へのショートカット

---

## 🎨 デザインシステム

### ブランドカラー（Store = 出店者用）
```css
/* Primary Colors */
--color-store-50: #F0F9F9;
--color-store-100: #D1EFED;
--color-store-200: #A3DFD9;
--color-store-300: #75CFC6;
--color-store-400: #5DABA8;  /* Primary */
--color-store-500: #4A9693;  /* Primary Dark */
--color-store-600: #3D7B79;
--color-store-700: #2F5F5E;
--color-store-800: #214443;
--color-store-900: #142928;

/* Semantic Colors */
--color-success: #10B981;
--color-success-light: #D1FAE5;
--color-warning: #F59E0B;
--color-warning-light: #FEF3C7;
--color-error: #EF4444;
--color-error-light: #FEE2E2;
--color-info: #3B82F6;
--color-info-light: #DBEAFE;

/* Neutral Colors */
--color-gray-50: #FAFAFA;
--color-gray-100: #F5F5F5;
--color-gray-200: #E5E7EB;
--color-gray-300: #D1D5DB;
--color-gray-400: #9CA3AF;
--color-gray-500: #6B7280;
--color-gray-600: #4B5563;
--color-gray-700: #374151;
--color-gray-800: #1F2937;
--color-gray-900: #111827;
```

### タイポグラフィ
```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### スペーシング
```css
/* 8px基準 */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### シャドウ
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### グラデーション
```css
/* Primary Gradient */
background: linear-gradient(135deg, #7FCAC5 0%, #5DABA8 50%, #4A9693 100%);

/* Subtle Gradient */
background: linear-gradient(135deg, #FFFFFF 0%, #F0F9F9 50%, #D1EFED 100%);

/* Overlay Gradient */
background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%);
```

---

## 📐 レイアウト構造

### デスクトップ（1024px以上）
```
┌───────────────────────────────────────────────────────────────┐
│ サイドバー │          メインコンテンツエリア                  │
│  (240px)  │                                                    │
│           │  ┌──────────────────────────────────────────────┐ │
│ ロゴ      │  │ ヘッダー（ページタイトル + 検索 + 通知）    │ │
│           │  └──────────────────────────────────────────────┘ │
│ [ホーム]  │                                                    │
│ [検索]    │  ┌──────────────────────────────────────────────┐ │
│ [申込]    │  │ ウェルカムメッセージ                         │ │
│ [お気入]  │  └──────────────────────────────────────────────┘ │
│ [通知]    │                                                    │
│ [プロフ]  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│           │  │ 統計1   │ │ 統計2   │ │ 統計3   │         │
│ ---       │  └─────────┘ └─────────┘ └─────────┘         │
│           │                                                    │
│ [ログアウト]│  ┌──────────────────────────────────────────────┐ │
│           │  │ 重要なアクション（アラート）                 │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                    │
│           │  ┌──────────────────────────────────────────────┐ │
│           │  │ おすすめイベント（カルーセル）               │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                    │
│           │  ┌──────────────────────────────────────────────┐ │
│           │  │ 今後の予定（カレンダー）                     │ │
│           │  └──────────────────────────────────────────────┘ │
│           │                                                    │
│           │  ┌──────────────────────────────────────────────┐ │
│           │  │ クイックアクション                           │ │
│           │  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### タブレット（768px - 1023px）
- サイドバーは折りたたみ可能（アイコンのみ表示）
- グリッドは2カラムに調整

### モバイル（393px - 767px）
```
┌─────────────────────────┐
│ トップバー               │
│ [≡] タイトル [🔔]       │
├─────────────────────────┤
│ ウェルカム               │
├─────────────────────────┤
│ 統計1                   │
│ 統計2                   │
│ 統計3                   │
├─────────────────────────┤
│ アクション               │
├─────────────────────────┤
│ おすすめイベント         │
│ （横スクロール）         │
├─────────────────────────┤
│ 今後の予定               │
├─────────────────────────┤
│ クイックアクション       │
├─────────────────────────┤
│ ボトムナビゲーション     │
│ [🏠] [🔍] [📋] [👤]     │
└─────────────────────────┘
```

---

## 🧩 コンポーネント詳細仕様

### 1. ヘッダー（Header）

**デスクトップ版**
```tsx
<header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
  <div className="flex items-center justify-between px-6 py-4">
    {/* ページタイトル */}
    <div>
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
      <p className="text-sm text-gray-500 mt-1">すべての情報をひとつに</p>
    </div>
    
    {/* 右側アクション */}
    <div className="flex items-center gap-4">
      {/* 検索バー */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="イベントを検索..."
          className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-store focus:border-transparent transition-all"
        />
      </div>
      
      {/* 通知アイコン */}
      <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>
      
      {/* プロフィールメニュー */}
      <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-store-400 to-store-600 flex items-center justify-center text-white font-semibold">
          田
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-gray-900">田中さん</p>
          <p className="text-xs text-gray-500">出店者</p>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  </div>
</header>
```

**モバイル版**
```tsx
<header className="sticky top-0 z-10 bg-white border-b border-gray-200">
  <div className="flex items-center justify-between px-4 py-3">
    <button className="p-2 -ml-2">
      <Menu className="w-6 h-6 text-gray-600" />
    </button>
    
    <h1 className="text-lg font-bold text-gray-900">Tomorrow</h1>
    
    <button className="p-2 -mr-2 relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  </div>
</header>
```

### 2. ウェルカムメッセージ

```tsx
<div className="mb-8 p-6 bg-gradient-to-br from-store-50 via-white to-store-50 rounded-xl border border-store-100">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        こんにちは、田中さん！👋
      </h2>
      <p className="text-gray-600">
        今週末のイベントが近づいています。準備は順調ですか？
      </p>
    </div>
    
    {/* 天気アイコン（オプション） */}
    <div className="hidden md:block">
      <Sun className="w-12 h-12 text-orange-400" />
    </div>
  </div>
  
  {/* 今日のタスク（オプション） */}
  <div className="mt-4 flex items-center gap-2 text-sm">
    <CheckCircle className="w-4 h-4 text-green-500" />
    <span className="text-gray-700">今日のタスク: 2/3完了</span>
  </div>
</div>
```

### 3. 統計カード（StatCard）

**デザイン仕様**
- 3カラムグリッド（デスクトップ）
- 1カラム（モバイル）
- 左上：グラデーションアイコン
- 右上：トレンド指標（↑↓）
- 中央：大きな数値
- 下部：ラベル
- hover時：shadow-md + 微妙な浮き上がり

```tsx
interface StatCardProps {
  title: string
  value: number | string
  icon: React.ReactNode
  gradient: string
  trend?: {
    value: number
    direction: 'up' | 'down'
    label?: string
  }
  onClick?: () => void
}

const StatCard = ({ title, value, icon, gradient, trend, onClick }: StatCardProps) => (
  <div
    onClick={onClick}
    className={cn(
      "bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 cursor-pointer group",
      onClick && "hover:-translate-y-1"
    )}
  >
    <div className="flex items-start justify-between mb-4">
      {/* アイコン */}
      <div className={cn(
        "p-3 rounded-xl bg-gradient-to-br shadow-sm group-hover:shadow-md transition-shadow",
        gradient
      )}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      {/* トレンド */}
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          trend.direction === 'up' 
            ? "bg-green-50 text-green-700" 
            : "bg-red-50 text-red-700"
        )}>
          {trend.direction === 'up' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    
    {/* 数値 */}
    <div className="text-3xl font-bold text-gray-900 mb-1">
      {value}
    </div>
    
    {/* ラベル */}
    <div className="text-sm text-gray-600">
      {title}
    </div>
    
    {/* トレンドラベル（オプション） */}
    {trend?.label && (
      <div className="text-xs text-gray-500 mt-2">
        {trend.label}
      </div>
    )}
  </div>
)

// 使用例
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <StatCard
    title="応募中"
    value={3}
    icon={<Send className="w-6 h-6" />}
    gradient="from-blue-400 to-blue-600"
    trend={{ value: 2, direction: 'up', label: '先週より2件増加' }}
    onClick={() => router.push('/applications?status=pending')}
  />
  <StatCard
    title="承認済み"
    value={8}
    icon={<CheckCircle className="w-6 h-6" />}
    gradient="from-green-400 to-green-600"
    trend={{ value: 3, direction: 'up', label: '先週より3件増加' }}
    onClick={() => router.push('/applications?status=approved')}
  />
  <StatCard
    title="今月の出店"
    value="5イベント"
    icon={<Calendar className="w-6 h-6" />}
    gradient="from-purple-400 to-purple-600"
    onClick={() => router.push('/calendar')}
  />
</div>
```

### 4. 重要なアクション（AlertBanner）

```tsx
interface Alert {
  id: string
  type: 'success' | 'warning' | 'info' | 'error'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

const AlertBanner = ({ alerts }: { alerts: Alert[] }) => {
  if (alerts.length === 0) return null
  
  const iconMap = {
    success: <CheckCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />
  }
  
  const colorMap = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      button: 'bg-green-600 hover:bg-green-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      text: 'text-orange-900',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      button: 'bg-red-600 hover:bg-red-700'
    }
  }
  
  return (
    <div className="space-y-3 mb-8">
      {alerts.map((alert) => {
        const colors = colorMap[alert.type]
        
        return (
          <div
            key={alert.id}
            className={cn(
              "p-4 rounded-xl border-2 animate-slide-down",
              colors.bg,
              colors.border
            )}
          >
            <div className="flex items-start gap-3">
              <div className={colors.icon}>
                {iconMap[alert.type]}
              </div>
              
              <div className="flex-1">
                <h3 className={cn("font-semibold mb-1", colors.text)}>
                  {alert.title}
                </h3>
                <p className={cn("text-sm", colors.text)}>
                  {alert.message}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                {alert.action && (
                  <button
                    onClick={alert.action.onClick}
                    className={cn(
                      "px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors",
                      colors.button
                    )}
                  >
                    {alert.action.label}
                  </button>
                )}
                
                {alert.onDismiss && (
                  <button
                    onClick={alert.onDismiss}
                    className="p-1 rounded hover:bg-black/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 使用例
const alerts: Alert[] = [
  {
    id: '1',
    type: 'success',
    title: '承認完了',
    message: '「花火大会フェス」への出店申し込みが承認されました！',
    action: {
      label: '詳細を見る',
      onClick: () => router.push('/applications/123')
    },
    onDismiss: () => dismissAlert('1')
  },
  {
    id: '2',
    type: 'warning',
    title: '締切間近',
    message: '「春の食フェス」の申し込み締切が明日です。',
    action: {
      label: '今すぐ申込',
      onClick: () => router.push('/events/456')
    }
  }
]
```

### 5. おすすめイベント（EventCarousel）

```tsx
interface EventCarouselProps {
  events: Event[]
  onEventClick: (eventId: string) => void
}

const EventCarousel = ({ events, onEventClick }: EventCarouselProps) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">おすすめイベント</h2>
        <p className="text-sm text-gray-600 mt-1">
          あなたにぴったりのイベントを見つけました
        </p>
      </div>
      <button className="text-sm font-medium text-store hover:text-store-dark transition-colors flex items-center gap-1">
        すべて見る
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
    
    {/* カルーセル */}
    <div className="overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-4 md:grid md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => onEventClick(event.id)}
            className="flex-shrink-0 w-72 md:w-auto cursor-pointer group"
          >
            <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* 画像 */}
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* ステータスバッジ */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                    募集中
                  </span>
                </div>
                
                {/* お気に入り */}
                <button className="absolute top-3 left-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              {/* コンテンツ */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.name}
                </h3>
                
                <div className="space-y-1.5 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                
                {/* タグ */}
                <div className="flex gap-2 flex-wrap">
                  {event.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-store-50 text-store-700 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
```

### 6. 今後の予定（UpcomingEvents）

```tsx
const UpcomingEvents = ({ events }: { events: Event[] }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">今後の予定</h2>
      <button className="text-sm font-medium text-store hover:text-store-dark transition-colors flex items-center gap-1">
        カレンダーで見る
        <Calendar className="w-4 h-4" />
      </button>
    </div>
    
    <div className="bg-white rounded-xl shadow-sm p-6">
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">今後の予定はありません</p>
          <button className="mt-4 text-store hover:text-store-dark font-medium text-sm">
            イベントを探す →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={event.id}
              className={cn(
                "flex items-start gap-4 pb-4",
                index !== events.length - 1 && "border-b border-gray-100"
              )}
            >
              {/* 日付ブロック */}
              <div className="flex-shrink-0 w-16 text-center">
                <div className="bg-store-50 rounded-lg p-2">
                  <div className="text-xs font-medium text-store-700">
                    {new Date(event.date).toLocaleDateString('ja-JP', { month: 'short' })}
                  </div>
                  <div className="text-2xl font-bold text-store">
                    {new Date(event.date).getDate()}
                  </div>
                </div>
              </div>
              
              {/* イベント情報 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {event.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
              
              {/* ステータス */}
              <div className="flex-shrink-0">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium",
                  event.status === 'approved' && "bg-green-50 text-green-700",
                  event.status === 'pending' && "bg-yellow-50 text-yellow-700"
                )}>
                  {event.status === 'approved' ? '承認済み' : '保留中'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)
```

### 7. クイックアクション

```tsx
const QuickActions = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <button className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group">
      <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
        <Search className="w-6 h-6" />
      </div>
      <span className="font-medium text-gray-900">イベント検索</span>
    </button>
    
    <button className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group">
      <div className="p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
        <FileText className="w-6 h-6" />
      </div>
      <span className="font-medium text-gray-900">書類管理</span>
    </button>
    
    <button className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group">
      <div className="p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
        <Calendar className="w-6 h-6" />
      </div>
      <span className="font-medium text-gray-900">カレンダー</span>
    </button>
    
    <button className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 flex flex-col items-center gap-3 group">
      <div className="p-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white group-hover:shadow-lg transition-shadow">
        <Settings className="w-6 h-6" />
      </div>
      <span className="font-medium text-gray-900">設定</span>
    </button>
  </div>
)
```

---

## 🎬 アニメーション・インタラクション

### トランジション
```css
/* スムーズな共通トランジション */
transition: all 0.2s ease-in-out;

/* ホバー時の浮き上がり */
hover:-translate-y-1 transition-transform duration-200

/* 影の変化 */
hover:shadow-lg transition-shadow duration-300

/* スケール変化（画像） */
group-hover:scale-105 transition-transform duration-300
```

### アニメーション
```tsx
// Tailwind設定に追加
keyframes: {
  'slide-down': {
    '0%': { transform: 'translateY(-10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  'pulse-ring': {
    '0%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(2)', opacity: '0' },
  }
}

animation: {
  'slide-down': 'slide-down 0.3s ease-out',
  'fade-in': 'fade-in 0.5s ease-out',
  'pulse-ring': 'pulse-ring 1s cubic-bezier(0, 0, 0.2, 1) infinite',
}
```

---

## 📱 レスポンシブブレークポイント

```tsx
// Tailwind設定
screens: {
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
}

// 使用例
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## ♿ アクセシビリティ

1. **キーボードナビゲーション**: すべてのインタラクティブ要素
2. **フォーカスリング**: `focus:ring-2 focus:ring-store`
3. **alt属性**: すべての画像
4. **aria-label**: アイコンのみのボタン
5. **カラーコントラスト**: WCAG AA準拠

---

## 🎯 実装の優先順位

1. **統計カード** - 最も目立つ要素
2. **アラートバナー** - アクションを促す
3. **おすすめイベント** - コンバージョンに直結
4. **今後の予定** - ユーザーの安心感
5. **クイックアクション** - 効率化

---

## 🔧 技術スタック

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS 3
- shadcn/ui
- lucide-react
- next/image

---

## 📚 参考サイト

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Linear Dashboard**: https://linear.app
- **GitHub Dashboard**: https://github.com
- **Notion Home**: https://notion.so

---

## ✅ 完成イメージ

この仕様を基に、完全に動作する、プロフェッショナルなダッシュボードコンポーネントを生成してください。

- すべてのコンポーネントをTypeScriptで型安全に
- レスポンシブデザイン完全対応
- スムーズなアニメーション
- ダミーデータを含む完全な実装
- コメント付きで理解しやすいコード

よろしくお願いします！

