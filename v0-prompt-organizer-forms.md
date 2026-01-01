# v0プロンプト：イベント作成・編集フォーム（主催者）

## 📋 目的

主催者が新規イベントを作成、または既存イベントを編集する多段階フォーム

---

## 🎨 カラー

```css
--color-organizer: #E58A7B;
--color-organizer-dark: #D87564;
```

---

## 📐 フォーム構成（7ステップ）

```
ステップ1: 基本情報（イベント名、開催日時、場所）
ステップ2: 詳細情報（説明文、ジャンル）
ステップ3: 画像アップロード（メイン画像、サブ画像）
ステップ4: 募集要項（募集人数、出店料、締切日）
ステップ5: 会場情報（アクセス、設備）
ステップ6: 注意事項（出店条件、禁止事項）
ステップ7: 確認・公開
```

---

## 🧩 実装コード（簡略版）

```tsx
const EventForm = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    dates: { start: '', end: '' },
    location: '',
    description: '',
    mainImage: null,
    capacity: 100,
    fee: 0,
    deadline: ''
  })

  const totalSteps = 7

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* プログレスインジケーター */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                i + 1 < currentStep && "bg-green-500 text-white",
                i + 1 === currentStep && "bg-[#E58A7B] text-white ring-4 ring-[#FEF5F3]",
                i + 1 > currentStep && "bg-gray-200 text-gray-500"
              )}>
                {i + 1 < currentStep ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={cn(
                  "flex-1 h-1 mx-2",
                  i + 1 < currentStep ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-600">
          ステップ {currentStep} / {totalSteps}
        </p>
      </div>

      {/* フォームコンテンツ */}
      <Card>
        <CardContent className="p-8">
          {currentStep === 1 && <Step1BasicInfo formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && <Step2Details formData={formData} setFormData={setFormData} />}
          {/* 他のステップ */}
        </CardContent>
      </Card>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          戻る
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          className="bg-[#E58A7B] hover:bg-[#D87564]"
        >
          {currentStep === totalSteps ? '公開する' : '次へ'}
        </Button>
      </div>
    </div>
  )
}
```

---

# v0プロンプト：申し込み審査画面（主催者）

## 📋 目的

出店者からの申し込みを審査・承認/却下する

---

## 📐 レイアウト

```
┌─────────────────────────────────────────┐
│ イベント: 夏フェス2024                   │
│ 申し込み一覧（保留中: 7件）              │
├─────────────────────────────────────────┤
│ [すべて] [保留中] [承認済み] [却下]     │
├─────────────────────────────────────────┤
│ ┌───────────────────────────────────┐   │
│ │ [アバター] 田中太郎              │   │
│ │ ハンドメイドアクセサリー販売      │   │
│ │ 申し込み日: 2024/6/15            │   │
│ │                                  │   │
│ │ [詳細を見る] [承認] [却下]       │   │
│ └───────────────────────────────────┘   │
│                                          │
│ [他の申し込み...]                        │
└─────────────────────────────────────────┘
```

---

## 🧩 実装コード

```tsx
const ApplicationReviewPage = ({ eventId }) => {
  const [activeTab, setActiveTab] = useState('pending')
  const [applications, setApplications] = useState([])

  const handleApprove = (appId) => {
    // 承認処理
    console.log('Approve:', appId)
  }

  const handleReject = (appId) => {
    // 却下処理
    console.log('Reject:', appId)
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">申し込み審査</h1>
        <p className="text-gray-600">夏フェス2024</p>
      </div>

      {/* タブ */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'rejected'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg font-semibold transition-all",
              activeTab === tab
                ? "bg-[#E58A7B] text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            {tab === 'all' && 'すべて'}
            {tab === 'pending' && '保留中'}
            {tab === 'approved' && '承認済み'}
            {tab === 'rejected' && '却下'}
          </button>
        ))}
      </div>

      {/* 申し込み一覧 */}
      <div className="space-y-4">
        {applications.map(app => (
          <Card key={app.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                {/* アバター */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F0A89E] to-[#E58A7B] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                  {app.exhibitorName[0]}
                </div>

                {/* 情報 */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">
                    {app.exhibitorName}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {app.businessDescription}
                  </p>
                  <div className="text-xs text-gray-500">
                    申し込み日: {app.appliedAt}
                  </div>
                </div>

                {/* アクション */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    詳細
                  </Button>
                  {app.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleApprove(app.id)}
                      >
                        承認
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleReject(app.id)}
                      >
                        却下
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

このプロンプトで、主催者向けのイベント管理機能を生成してください！

