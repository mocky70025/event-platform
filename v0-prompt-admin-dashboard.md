# v0プロンプト：管理者ダッシュボード（Admin）

## 📋 プロジェクトコンテキスト

**Tomorrow** - プラットフォーム管理者向け  
**対象**: プラットフォーム運営者  
**目的**: 主催者・出店者・イベントを統括管理

---

## 🎨 デザインシステム（Admin = 管理者用）

### カラー
```css
--color-admin: #3B82F6;      /* Primary - ブルー */
--color-admin-dark: #2563EB;  /* Primary Dark */
--color-admin-light: #60A5FA; /* Primary Light */
```

---

## 🎯 この画面の目的

1. **全体統計**: プラットフォーム全体のKPI把握
2. **承認管理**: 主催者・イベントの承認
3. **ユーザー管理**: 出店者・主催者の管理
4. **問題対応**: 報告された問題の対応

---

## 📐 レイアウト

```
┌─────────────────────────────────────────────────────────┐
│ 全体統計（4つの大きな数値）                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│ │総ユーザー │ │アクティブ │ │総イベント │ │今月の成約│ │
│ │ 1,234人  │ │ 856人    │ │ 89件    │ │ 245件   │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
├─────────────────────────────────────────────────────────┤
│ 🚨 承認待ち                                              │
│ • 新規主催者: 3件 → 今すぐ承認                          │
│ • 新規イベント: 5件 → 今すぐ承認                        │
├─────────────────────────────────────────────────────────┤
│ 📊 最近のアクティビティ                                 │
│ • 田中太郎さんが新規登録（出店者）                      │
│ • 「夏フェス2024」が公開されました                      │
│ • 株式会社〇〇が主催者として登録申請                    │
├─────────────────────────────────────────────────────────┤
│ 📈 月別統計グラフ                                        │
│ [ユーザー増加数・イベント数・申し込み数のグラフ]        │
└─────────────────────────────────────────────────────────┘
```

---

## 🧩 実装コード

```tsx
const AdminDashboard = () => {
  const stats = {
    totalUsers: 1234,
    activeUsers: 856,
    totalEvents: 89,
    monthlyApplications: 245
  }

  const pendingApprovals = {
    organizers: 3,
    events: 5
  }

  const recentActivities = [
    {
      id: '1',
      type: 'user_registered',
      message: '田中太郎さんが新規登録（出店者）',
      time: '5分前'
    },
    {
      id: '2',
      type: 'event_published',
      message: '「夏フェス2024」が公開されました',
      time: '15分前'
    },
    {
      id: '3',
      type: 'organizer_applied',
      message: '株式会社〇〇が主催者として登録申請',
      time: '1時間前'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            管理者ダッシュボード
          </h1>
          <p className="text-gray-600 mt-1">
            プラットフォーム全体を統括管理
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* 全体統計 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="総ユーザー数"
            value={stats.totalUsers.toLocaleString()}
            icon={<Users className="w-6 h-6" />}
            gradient="from-blue-400 to-blue-600"
            trend={{ value: 45, direction: 'up', label: '今月' }}
          />
          <StatCard
            title="アクティブユーザー"
            value={stats.activeUsers.toLocaleString()}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-green-400 to-green-600"
          />
          <StatCard
            title="総イベント数"
            value={stats.totalEvents}
            icon={<Calendar className="w-6 h-6" />}
            gradient="from-purple-400 to-purple-600"
          />
          <StatCard
            title="今月の成約数"
            value={stats.monthlyApplications}
            icon={<CheckCircle className="w-6 h-6" />}
            gradient="from-orange-400 to-orange-600"
          />
        </div>

        {/* 承認待ち */}
        {(pendingApprovals.organizers > 0 || pendingApprovals.events > 0) && (
          <Card className="mb-8 border-l-4 border-orange-500">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-orange-500" />
                承認待ち
              </h2>
              <div className="space-y-3">
                {pendingApprovals.organizers > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      新規主催者: <strong>{pendingApprovals.organizers}件</strong>
                    </span>
                    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                      今すぐ承認
                    </Button>
                  </div>
                )}
                {pendingApprovals.events > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">
                      新規イベント: <strong>{pendingApprovals.events}件</strong>
                    </span>
                    <Button size="sm" className="bg-[#3B82F6] hover:bg-[#2563EB]">
                      今すぐ承認
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 最近のアクティビティ */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">最近のアクティビティ</h2>
            <div className="space-y-3">
              {recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-gray-700">{activity.message}</span>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* クイックアクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<Users />}
            title="ユーザー管理"
            description="出店者・主催者を管理"
            gradient="from-blue-400 to-blue-600"
          />
          <QuickActionCard
            icon={<Calendar />}
            title="イベント管理"
            description="全てのイベントを確認"
            gradient="from-purple-400 to-purple-600"
          />
          <QuickActionCard
            icon={<BarChart3 />}
            title="統計レポート"
            description="詳細な分析を確認"
            gradient="from-green-400 to-green-600"
          />
        </div>
      </main>
    </div>
  )
}
```

---

## 🎯 出店者・主催者アプリとの違い

1. **カラー**: ブルー系（#3B82F6）
2. **視点**: プラットフォーム全体
3. **権限**: 最高権限（承認・却下・削除）
4. **統計**: 全体のKPI

---

このプロンプトで、管理者向けのプラットフォーム管理画面を生成してください！

