# 出店者アプリ：超詳細デザイン戦略

## 📊 出店者ペルソナ分析

### ペルソナ1: 田中さん（28歳・個人事業主）
```
【プロフィール】
- 職業: ハンドメイドアクセサリー作家
- 経験: イベント出店歴2年
- ITスキル: 中程度（スマホは使いこなす、PCはたまに）
- 使用デバイス: iPhone（メイン）、iPad
- 出店頻度: 月2-3回

【ゴール】
- より多くのイベントに出店したい
- 効率的にイベントを探したい
- 申し込みの手間を減らしたい

【ペインポイント】
- イベント情報が分散している（Instagram、メール、紙）
- 申し込み後の状況がわからない
- 書類の準備が面倒（毎回同じ書類を送る）
- 締め切りを忘れがち

【期待する体験】
- スマホで全て完結
- 過去の書類を再利用できる
- リマインダー通知が来る
- お気に入りのイベントを保存できる
```

### ペルソナ2: 山田さん（45歳・中小企業経営者）
```
【プロフィール】
- 職業: キッチンカー経営（従業員3名）
- 経験: 食イベント出店歴10年
- ITスキル: 低〜中（基本的な操作のみ）
- 使用デバイス: Android、PC（事務所）
- 出店頻度: 週末は必ず（月8-10回）

【ゴール】
- 売上アップのため出店機会を最大化
- 従業員のスケジュール調整
- 効率的な申し込み・承認管理

【ペインポイント】
- PCとスマホで情報が同期されない
- 複数イベントの管理が大変
- 申し込み状況の把握に時間がかかる
- 主催者との連絡が取りづらい

【期待する体験】
- デスクトップでも快適に使える
- 一覧で全ての申し込みを確認
- カレンダービューで予定を把握
- 主催者とのメッセージ機能
```

### ペルソナ3: 佐藤さん（35歳・企業マーケティング担当）
```
【プロフィール】
- 職業: 中堅企業のイベント担当
- 経験: 企業ブース出展歴5年
- ITスキル: 高（業務でSaaS使用）
- 使用デバイス: PC（メイン）、会社スマホ
- 出店頻度: 月1-2回（大規模イベント中心）

【ゴール】
- 承認プロセスを効率化
- 上司への報告資料を簡単に作成
- コンプライアンス遵守

【ペインポイント】
- 複数の承認者がいる
- 書類のバージョン管理
- データのエクスポート機能がない

【期待する体験】
- エクスポート機能（CSV、PDF）
- 承認フロー機能
- 詳細な検索・フィルター
- レポート機能
```

---

## 🗺️ ユーザージャーニーマップ（出店者）

### フェーズ1: 登録・認証
```
【シーン】初めてプラットフォームを使う

┌─────────────────────────────────────────────────────────┐
│ タッチポイント │ アクション │ 感情 │ 思考 │ ペインポイント │
├─────────────────────────────────────────────────────────┤
│ ランディング  │ サイト訪問 │ 😐 中立 │ "本当に便利？" │ 信頼性が不明 │
│ WelcomeScreen │ 登録/ログイン │ 😟 不安 │ "簡単に登録できる？" │ 入力が面倒 │
│ 情報登録Form │ プロフィール入力 │ 😣 ストレス │ "なぜこんなに項目が？" │ 入力項目が多い │
│ 書類Upload   │ 画像アップロード │ 😤 イライラ │ "写真の撮り方がわからない" │ 手順が不明確 │
│ 承認待ち     │ 待機 │ 😐 期待 │ "いつ承認される？" │ 進捗がわからない │
│ 承認完了     │ 通知受信 │ 😊 安心 │ "やっと使える！" │ なし │
└─────────────────────────────────────────────────────────┘

【改善策】
1. WelcomeScreen
   - 信頼のシグナル（利用者数、レビュー）
   - 3ステップで完了を明示
   - ソーシャルログインで簡略化

2. 情報登録Form
   - 必須項目を最小限に
   - 後で追加できることを明示
   - プログレスバーで進捗可視化
   - サンプル画像で書類の撮り方を説明

3. 承認待ち
   - 承認までの目安時間を表示
   - 次にできることを提案（イベント検索など）
```

### フェーズ2: イベント検索・発見
```
【シーン】出店できるイベントを探す

┌─────────────────────────────────────────────────────────┐
│ タッチポイント │ アクション │ 感情 │ 思考 │ 期待 │
├─────────────────────────────────────────────────────────┤
│ ダッシュボード │ ホーム画面を見る │ 😊 期待 │ "どんなイベントがある？" │ おすすめが表示される │
│ 検索バー     │ キーワード検索 │ 🤔 探索 │ "地元のイベントは？" │ 即座に結果が出る │
│ フィルター   │ 条件絞り込み │ 😌 満足 │ "ちょうどいいのが見つかった" │ 精度が高い │
│ イベントカード │ 詳細を確認 │ 😊 興味 │ "雰囲気が良さそう" │ 必要情報が全て見える │
│ お気に入り   │ 保存 │ 😊 安心 │ "後でゆっくり検討しよう" │ 簡単に保存できる │
└─────────────────────────────────────────────────────────┘

【改善策】
1. ダッシュボード
   - おすすめイベント（AIレコメンド）
   - 人気のイベント
   - 締め切り間近のイベント
   - 最近見たイベント

2. 検索・フィルター
   - インクリメンタルサーチ（入力中に候補表示）
   - 位置情報ベース検索
   - 保存した検索条件
   - 詳細フィルター（日付、場所、ジャンル、募集人数）

3. イベントカード
   - 一目で重要情報がわかる
   - 画像で雰囲気が伝わる
   - ステータスバッジ（募集中/残席わずか/終了）
   - ワンタップでお気に入り
```

### フェーズ3: 申し込み・承認待ち
```
【シーン】イベントに申し込む

┌─────────────────────────────────────────────────────────┐
│ タッチポイント │ アクション │ 感情 │ 思考 │ ペインポイント │
├─────────────────────────────────────────────────────────┤
│ イベント詳細 │ 申し込みボタン │ 😊 決意 │ "これに出たい！" │ なし │
│ 確認画面     │ 内容確認 │ 🤔 慎重 │ "間違いないか確認" │ 修正方法が不明 │
│ 申し込み完了 │ 完了画面 │ 😊 達成感 │ "無事に申し込めた" │ 次にすることが不明 │
│ 承認待ち     │ 待機 │ 😐 期待 │ "承認されるかな？" │ 進捗がわからない │
│ 承認通知     │ 通知受信 │ 😄 喜び │ "承認された！" │ なし │
│ 準備         │ 必要な準備確認 │ 🤔 確認 │ "何を準備すればいい？" │ 情報が散らばる │
└─────────────────────────────────────────────────────────┘

【改善策】
1. 確認画面
   - 申し込み内容を明確に表示
   - 主催者への質問欄（オプション）
   - キャンセルポリシーの明示

2. 完了画面
   - 次のアクション提案
   - カレンダーに追加ボタン
   - 準備すべきことのチェックリスト

3. 承認待ち
   - リアルタイムステータス更新
   - プッシュ通知設定
   - 承認までの平均時間を表示
```

---

## 🏗️ 情報アーキテクチャ（出店者アプリ）

### サイトマップ
```
Store App（出店者向け）
│
├── 🏠 ホーム/ダッシュボード
│   ├── おすすめイベント
│   ├── 統計情報（応募中/承認済み/却下）
│   ├── 最近の活動
│   └── クイックアクション
│
├── 🔍 イベント検索
│   ├── 検索バー
│   ├── フィルター（日付/場所/ジャンル）
│   ├── イベント一覧（リスト/グリッド切替）
│   └── イベント詳細
│       ├── 基本情報
│       ├── 会場情報
│       ├── 主催者情報
│       ├── 募集要項
│       ├── 申し込み履歴（自分の）
│       └── 申し込みボタン
│
├── 💼 申し込み管理
│   ├── 全ての申し込み
│   ├── ステータス別（保留/承認/却下）
│   ├── カレンダービュー
│   └── 申し込み詳細
│       ├── イベント情報
│       ├── ステータス
│       ├── 主催者とのメッセージ
│       └── キャンセル
│
├── ⭐ お気に入り
│   ├── 保存したイベント
│   └── 保存した検索条件
│
├── 🔔 通知
│   ├── 申し込み承認/却下
│   ├── イベントリマインダー
│   ├── 新着イベント
│   └── システム通知
│
├── 👤 プロフィール
│   ├── 基本情報編集
│   ├── 書類管理
│   │   ├── 営業許可証
│   │   ├── 車検証
│   │   ├── 保険証書
│   │   └── 消防設備図
│   ├── 設定
│   │   ├── 通知設定
│   │   ├── アカウント設定
│   │   └── セキュリティ
│   └── ログアウト
│
└── ⚙️ その他
    ├── ヘルプ・FAQ
    ├── お問い合わせ
    ├── 利用規約
    └── プライバシーポリシー
```

### ナビゲーション構造

**デスクトップ（1024px以上）**
```
┌─────────────────────────────────────────────────────┐
│ ┌─────────┐ ┌───────────────────────────────────┐ │
│ │         │ │ トップバー                         │ │
│ │         │ │ [検索] [通知] [プロフィール]      │ │
│ │ サイド  │ ├───────────────────────────────────┤ │
│ │ バー    │ │                                   │ │
│ │         │ │                                   │ │
│ │ [ホーム]│ │    メインコンテンツエリア          │ │
│ │ [検索]  │ │                                   │ │
│ │ [申込]  │ │                                   │ │
│ │ [お気]  │ │                                   │ │
│ │ [通知]  │ │                                   │ │
│ │ [設定]  │ │                                   │ │
│ │         │ │                                   │ │
│ │ [ログ]  │ │                                   │ │
│ └─────────┘ └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**モバイル（393px基準）**
```
┌─────────────────────┐
│ トップバー           │
│ [≡] タイトル [🔔]   │
├─────────────────────┤
│                     │
│                     │
│  メインコンテンツ    │
│                     │
│                     │
├─────────────────────┤
│ ボトムナビゲーション │
│ [🏠] [🔍] [📋] [👤] │
└─────────────────────┘
```

---

## 📱 画面別詳細設計

### 1. ホーム/ダッシュボード

**目的**: 出店者に必要な情報を一目で提供し、次のアクションを促す

**レイアウト構成**
```
┌────────────────────────────────────────────────────┐
│ 🎯 ウェルカムメッセージ                             │
│ "こんにちは、田中さん！ 今週末のイベントが近づいています" │
├────────────────────────────────────────────────────┤
│ 📊 統計カード（3カラムグリッド）                     │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│ │ 応募中    │ │ 承認済み  │ │ 今月の出店│          │
│ │   3件    │ │   8件    │ │  5イベント│          │
│ │  📤      │ │  ✅      │ │  📅      │          │
│ └──────────┘ └──────────┘ └──────────┘          │
├────────────────────────────────────────────────────┤
│ 🔔 重要なアクション                                  │
│ • "花火大会フェス"の承認が完了しました → 詳細を見る  │
│ • "春の食フェス"の申し込み締切が明日です → 今すぐ申込│
├────────────────────────────────────────────────────┤
│ ⭐ おすすめイベント                                  │
│ "あなたにぴったりのイベントを見つけました"            │
│ ┌──────────────┐ ┌──────────────┐              │
│ │ [イベント画像] │ │ [イベント画像] │              │
│ │ 夏フェス2024   │ │ アート＆クラフト│              │
│ │ 7/15-16       │ │ 8/1-3         │              │
│ │ 残席: 5       │ │ 人気イベント   │              │
│ └──────────────┘ └──────────────┘              │
├────────────────────────────────────────────────────┤
│ 📅 今後の予定（カレンダービュー）                     │
│ 7月15日 夏フェス2024                                │
│ 7月22日 ビアガーデンフェス                           │
│ 8月3日  アート＆クラフト                             │
├────────────────────────────────────────────────────┤
│ 🚀 クイックアクション                                │
│ [新しいイベントを探す] [プロフィールを編集]          │
└────────────────────────────────────────────────────┘
```

**デザイン仕様**
```tsx
// 統計カード
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <StatCard
    title="応募中"
    value={3}
    icon={<Send className="w-6 h-6" />}
    gradient="from-blue-400 to-blue-600"
    trend={{ value: 2, direction: 'up' }}
  />
  <StatCard
    title="承認済み"
    value={8}
    icon={<CheckCircle className="w-6 h-6" />}
    gradient="from-green-400 to-green-600"
    trend={{ value: 3, direction: 'up' }}
  />
  <StatCard
    title="今月の出店"
    value={5}
    icon={<Calendar className="w-6 h-6" />}
    gradient="from-purple-400 to-purple-600"
  />
</div>

// StatCardコンポーネント
interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  gradient: string
  trend?: { value: number; direction: 'up' | 'down' }
}

const StatCard = ({ title, value, icon, gradient, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
        <div className="text-white">{icon}</div>
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
        )}>
          {trend.direction === 'up' ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-sm text-gray-600 mt-1">{title}</div>
  </div>
)
```

### 2. イベント検索・一覧

**目的**: 効率的にイベントを探し、比較し、申し込む

**レイアウト構成**
```
┌────────────────────────────────────────────────────┐
│ 🔍 検索バー                                         │
│ [🔍 "フェス"と検索] [フィルター] [ソート] [表示切替]│
├────────────────────────────────────────────────────┤
│ 🎯 アクティブフィルター                             │
│ [📍 東京都 ×] [📅 今月 ×] [🎨 アート ×] [クリア]   │
├────────────────────────────────────────────────────┤
│ 📊 検索結果: 24件のイベント                         │
│                                                     │
│ ┌──────────────────────────────────────────────┐  │
│ │ [イベント画像]                                 │  │
│ │                                                │  │
│ │ 夏フェス2024                          [❤️]     │  │
│ │ 📅 2024/7/15-16  📍 代々木公園  👥 50/100    │  │
│ │ 🏷️ [音楽] [食] [ファミリー]                   │  │
│ │                                                │  │
│ │ 都内最大級の夏イベント。音楽ライブ、フード...   │  │
│ │                                                │  │
│ │ 主催: 〇〇イベント企画                          │  │
│ │ [詳細を見る] [今すぐ申し込む]                  │  │
│ └──────────────────────────────────────────────┘  │
│                                                     │
│ [次のイベント...]                                   │
│                                                     │
├────────────────────────────────────────────────────┤
│ ページネーション: < 1 2 3 ... 8 >                    │
└────────────────────────────────────────────────────┘
```

**検索・フィルター機能**
```tsx
// 検索コンポーネント
<div className="mb-6">
  <div className="relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    <input
      type="text"
      placeholder="イベント名、場所、キーワードで検索..."
      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-store focus:border-transparent"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
  
  {/* フィルターパネル */}
  <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
    <FilterButton icon={<MapPin />} label="場所" active={filters.location} />
    <FilterButton icon={<Calendar />} label="日付" active={filters.date} />
    <FilterButton icon={<Tag />} label="ジャンル" active={filters.genre} />
    <FilterButton icon={<Users />} label="募集人数" active={filters.capacity} />
    <FilterButton icon={<DollarSign />} label="出店料" active={filters.fee} />
  </div>
  
  {/* アクティブフィルター */}
  {activeFilters.length > 0 && (
    <div className="flex gap-2 mt-3 flex-wrap">
      {activeFilters.map((filter) => (
        <Badge
          key={filter.id}
          variant="secondary"
          className="gap-2"
        >
          {filter.label}
          <X
            className="w-3 h-3 cursor-pointer"
            onClick={() => removeFilter(filter.id)}
          />
        </Badge>
      ))}
      <button
        onClick={clearAllFilters}
        className="text-sm text-gray-600 hover:text-gray-900"
      >
        すべてクリア
      </button>
    </div>
  )}
</div>
```

### 3. イベントカード（改善版）

**目的**: 魅力的に情報を伝え、アクションを促す

**完全なコンポーネント設計**
```tsx
interface EnhancedEventCardProps {
  event: {
    id: string
    name: string
    date: { start: string; end: string }
    displayPeriod: string
    location: {
      name: string
      address: string
      prefecture: string
    }
    capacity: {
      total: number
      current: number
    }
    image: string
    status: 'open' | 'closing_soon' | 'closed'
    tags: string[]
    organizer: {
      name: string
      avatar: string
    }
    fee?: number
    description: string
    isFavorite?: boolean
  }
  onFavoriteToggle: (id: string) => void
  onApply: (id: string) => void
  onViewDetail: (id: string) => void
}

const EnhancedEventCard = ({ event, onFavoriteToggle, onApply, onViewDetail }: EnhancedEventCardProps) => (
  <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
    {/* 画像エリア */}
    <div className="relative aspect-video overflow-hidden">
      <Image
        src={event.image}
        alt={event.name}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      
      {/* グラデーションオーバーレイ */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* ステータスバッジ（右上） */}
      <div className="absolute top-4 right-4">
        <StatusBadge status={event.status} />
      </div>
      
      {/* お気に入りボタン（右上） */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onFavoriteToggle(event.id)
        }}
        className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
      >
        <Heart
          className={cn(
            "w-5 h-5 transition-colors",
            event.isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
          )}
        />
      </button>
      
      {/* タイトル（画像下部オーバーレイ） */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-xl font-bold text-white line-clamp-2">
          {event.name}
        </h3>
      </div>
    </div>
    
    {/* コンテンツエリア */}
    <div className="p-5">
      {/* メタ情報（アイコン付き） */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{event.displayPeriod}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{event.location.name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>
            募集: {event.capacity.current}/{event.capacity.total}
            {event.capacity.current / event.capacity.total > 0.8 && (
              <span className="ml-2 text-orange-600 font-medium">残りわずか！</span>
            )}
          </span>
        </div>
        {event.fee && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>{event.fee.toLocaleString()}円</span>
          </div>
        )}
      </div>
      
      {/* タグ */}
      <div className="flex gap-2 flex-wrap mb-4">
        {event.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-1 bg-store-50 text-store-700 text-xs font-medium rounded-full"
          >
            {tag}
          </span>
        ))}
        {event.tags.length > 3 && (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            +{event.tags.length - 3}
          </span>
        )}
      </div>
      
      {/* 説明文 */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {event.description}
      </p>
      
      {/* 主催者情報 */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          {event.organizer.avatar ? (
            <Image
              src={event.organizer.avatar}
              alt={event.organizer.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs font-medium">
              {event.organizer.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">主催</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {event.organizer.name}
          </p>
        </div>
      </div>
      
      {/* アクションボタン */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetail(event.id)}
        >
          詳細を見る
        </Button>
        <Button
          className="flex-1 bg-store hover:bg-store-dark"
          onClick={() => onApply(event.id)}
          disabled={event.status === 'closed'}
        >
          {event.status === 'closed' ? '募集終了' : '申し込む'}
        </Button>
      </div>
    </div>
  </div>
)

// ステータスバッジコンポーネント
const StatusBadge = ({ status }: { status: 'open' | 'closing_soon' | 'closed' }) => {
  const config = {
    open: {
      label: '募集中',
      className: 'bg-green-500 text-white',
      icon: <CheckCircle className="w-3 h-3" />
    },
    closing_soon: {
      label: '締切間近',
      className: 'bg-orange-500 text-white',
      icon: <Clock className="w-3 h-3" />
    },
    closed: {
      label: '募集終了',
      className: 'bg-gray-500 text-white',
      icon: <XCircle className="w-3 h-3" />
    }
  }
  
  const { label, className, icon } = config[status]
  
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm",
      className
    )}>
      {icon}
      <span>{label}</span>
    </div>
  )
}
```

---

## 🎨 完璧なv0プロンプト生成

次に、この詳細分析を基にv0プロンプトを生成しましょうか？

または、さらに他の画面（プロフィール、申し込み管理など）も深堀りしますか？


