# v0プロンプト集：残りの画面（プロフィール・申し込み管理）

## 1️⃣ プロフィール画面

### 目的
出店者が自分の情報と書類を管理する

### レイアウト
```
┌─────────────────────────────────────────┐
│ プロフィールヘッダー                     │
│ [アバター] 田中太郎                      │
│ tanaka@example.com                      │
│ [プロフィール編集]                       │
├─────────────────────────────────────────┤
│ 基本情報                                 │
│ 名前: 田中太郎                          │
│ 性別: 男性                              │
│ 年齢: 28歳                              │
│ 電話: 090-1234-5678                     │
├─────────────────────────────────────────┤
│ 登録書類                                 │
│ ✅ 営業許可証                           │
│ ✅ 車検証                               │
│ ✅ 自賠責保険                           │
│ ✅ PL保険                               │
│ ⚠️ 消防設備配置図（期限切れ）           │
│ [書類を更新]                            │
├─────────────────────────────────────────┤
│ アカウント設定                           │
│ 通知設定 / セキュリティ / ログアウト     │
└─────────────────────────────────────────┘
```

### 実装コード（簡略版）
```tsx
const ProfilePage = () => (
  <div className="max-w-4xl mx-auto p-6">
    {/* プロフィールヘッダー */}
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#7FCAC5] to-[#5DABA8] flex items-center justify-center text-white text-3xl font-bold">
            田
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">田中太郎</h1>
            <p className="text-gray-600">tanaka@example.com</p>
            <Button className="mt-3 bg-[#5DABA8] hover:bg-[#4A9693]">
              プロフィール編集
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    
    {/* 基本情報 */}
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">基本情報</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">名前</p>
            <p className="font-semibold">田中太郎</p>
          </div>
          {/* 他の情報 */}
        </div>
      </CardContent>
    </Card>
    
    {/* 登録書類 */}
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">登録書類</h2>
        <div className="space-y-3">
          <DocumentItem
            name="営業許可証"
            status="valid"
            expiryDate="2025-12-31"
          />
          {/* 他の書類 */}
        </div>
      </CardContent>
    </Card>
  </div>
)
```

---

## 2️⃣ 申し込み管理画面

### 目的
全ての申し込みをステータス別に管理

### レイアウト
```
┌─────────────────────────────────────────┐
│ タブ切り替え                             │
│ [すべて] [保留中] [承認済み] [却下]     │
├─────────────────────────────────────────┤
│ 申し込み一覧                             │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ 夏フェス2024                      │   │
│ │ 2024/7/15-16                     │   │
│ │ 代々木公園                        │   │
│ │ [承認済み] 2024/6/20に承認        │   │
│ │ [詳細] [メッセージ]              │   │
│ └──────────────────────────────────┘   │
│                                          │
│ ┌──────────────────────────────────┐   │
│ │ 春の食フェス                      │   │
│ │ 2024/8/10-11                     │   │
│ │ お台場                           │   │
│ │ [保留中] 審査中...                │   │
│ │ [詳細] [キャンセル]              │   │
│ └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 実装コード（簡略版）
```tsx
const ApplicationManagementPage = () => {
  const [activeTab, setActiveTab] = useState('all')
  
  const tabs = [
    { value: 'all', label: 'すべて', count: 12 },
    { value: 'pending', label: '保留中', count: 3 },
    { value: 'approved', label: '承認済み', count: 8 },
    { value: 'rejected', label: '却下', count: 1 }
  ]
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">申し込み管理</h1>
      
      {/* タブ */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap",
              activeTab === tab.value
                ? "bg-[#5DABA8] text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn(
                "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                activeTab === tab.value
                  ? "bg-white/30 text-white"
                  : "bg-gray-200 text-gray-700"
              )}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      
      {/* 申し込み一覧 */}
      <div className="space-y-4">
        {applications.map(app => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>
    </div>
  )
}

const ApplicationCard = ({ application }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold mb-2">{application.eventName}</h3>
          <div className="space-y-1 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{application.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{application.location}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusBadge status={application.status} />
            <span className="text-sm text-gray-600">
              {application.statusText}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            詳細
          </Button>
          {application.status === 'pending' ? (
            <Button variant="outline" size="sm" className="text-red-600">
              キャンセル
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              メッセージ
            </Button>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '保留中' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', label: '承認済み' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: '却下' }
  }
  
  const s = config[status]
  
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold",
      s.bg,
      s.text
    )}>
      {s.label}
    </span>
  )
}
```

---

## 共通デザイン要素

### カラー
```css
--color-store: #5DABA8;
--color-store-dark: #4A9693;
--color-store-50: #F0F9F9;
```

### コンポーネント
- Button（shadcn/ui）
- Card（shadcn/ui）
- Badge（カスタム）
- lucide-react（アイコン）

### トランジション
```css
transition: all 0.2s ease-in-out;
```

---

このプロンプトで、プロフィール画面と申し込み管理画面を生成してください！

