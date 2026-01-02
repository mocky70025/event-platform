# v0プロンプト統合ガイド

## 📚 プロンプトファイル一覧

### 🏪 出店者アプリ（Store）
- `v0-prompt-exhibitor-dashboard.md` - ダッシュボード
- `v0-prompt-exhibitor-event-list.md` - イベント検索・一覧
- `v0-prompt-exhibitor-event-card.md` - イベントカード
- `v0-prompt-exhibitor-welcome.md` - ログイン画面
- `v0-prompt-exhibitor-profile.md` - プロフィール・申し込み管理

### 🎪 主催者アプリ（Organizer）
- `v0-prompt-organizer-dashboard.md` - ダッシュボード
- `v0-prompt-organizer-forms.md` - イベント作成フォーム・申し込み審査

### 👨‍💼 管理者アプリ（Admin）
- `v0-prompt-admin-dashboard.md` - 管理者ダッシュボード

---

## 🎨 共通デザインシステム

### ブランドカラー
```css
/* 出店者 (Store) */
--color-store: #5DABA8;
--color-store-dark: #4A8F8C;
--color-store-light: #7BC1BE;

/* 主催者 (Organizer) */
--color-organizer: #E58A7B;
--color-organizer-dark: #D87564;
--color-organizer-light: #F0A89E;

/* 管理者 (Admin) */
--color-admin: #3B82F6;
--color-admin-dark: #2563EB;
--color-admin-light: #60A5FA;
```

### タイポグラフィ
```css
/* 見出し */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* H1 */ font-size: 2.25rem; font-weight: 700; line-height: 1.2;
/* H2 */ font-size: 1.875rem; font-weight: 700; line-height: 1.3;
/* H3 */ font-size: 1.5rem; font-weight: 600; line-height: 1.4;
/* Body */ font-size: 1rem; font-weight: 400; line-height: 1.6;
/* Small */ font-size: 0.875rem; font-weight: 400; line-height: 1.5;
```

### スペーシング（8pxベース）
```
0: 0px      1: 0.25rem (4px)   2: 0.5rem (8px)    3: 0.75rem (12px)
4: 1rem (16px)   5: 1.25rem (20px)  6: 1.5rem (24px)   8: 2rem (32px)
10: 2.5rem (40px)  12: 3rem (48px)    16: 4rem (64px)    20: 5rem (80px)
```

### シャドウ
```css
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
```

### 角丸
```css
rounded-sm: 0.125rem (2px)
rounded: 0.25rem (4px)
rounded-md: 0.375rem (6px)
rounded-lg: 0.5rem (8px)
rounded-xl: 0.75rem (12px)
rounded-full: 9999px
```

---

## 📋 v0への投入順序

### Phase 1: 出店者アプリ（最優先）
1. `v0-prompt-exhibitor-dashboard.md`
2. `v0-prompt-exhibitor-event-list.md`
3. `v0-prompt-exhibitor-event-card.md`
4. `v0-prompt-exhibitor-welcome.md`
5. `v0-prompt-exhibitor-profile.md`

### Phase 2: 主催者アプリ
6. `v0-prompt-organizer-dashboard.md`
7. `v0-prompt-organizer-forms.md`

### Phase 3: 管理者アプリ
8. `v0-prompt-admin-dashboard.md`

---

## 🎯 v0への投入方法

### オプションA: 個別投入（推奨）
各プロンプトファイルを1つずつv0に投入し、生成されたコードを確認・調整してから次へ進む。

**メリット**:
- 細かい調整が可能
- 問題の早期発見

### オプションB: 一括投入
全てのプロンプトをまとめてv0に投入する。

**メリット**:
- スピードが速い
- 全体の統一感

**投入テンプレート**:
```
以下の8つの画面を、統一されたデザインシステムで生成してください。

【共通デザインシステム】
- Tailwind CSS + shadcn/ui を使用
- レスポンシブデザイン（モバイルファースト）
- アクセシビリティ: WCAG AA準拠

【出店者アプリ（Primary Color: #5DABA8）】
1. ダッシュボード: [v0-prompt-exhibitor-dashboard.mdの内容]
2. イベント検索: [v0-prompt-exhibitor-event-list.mdの内容]
...

【主催者アプリ（Primary Color: #E58A7B）】
...

【管理者アプリ（Primary Color: #3B82F6）】
...
```

---

## ✅ チェックリスト

### コード生成後の確認項目
- [ ] 全ての画面が同じコンポーネントライブラリを使用
- [ ] カラーが正しく適用されている（Store=#5DABA8, Organizer=#E58A7B, Admin=#3B82F6）
- [ ] レスポンシブデザインが機能している
- [ ] アニメーションが自然
- [ ] アクセシビリティが考慮されている
- [ ] TypeScriptの型が正しい
- [ ] 既存のSupabase連携と統合可能

### 統合時の確認項目
- [ ] 既存の`lib/`フォルダとの整合性
- [ ] 既存の型定義との整合性
- [ ] ビルドエラーがない
- [ ] 開発サーバーで正常に動作

---

## 🚀 次のアクション

1. **v0に全プロンプトを投入**
2. **生成されたコードをレビュー**
3. **既存コードベースに統合**
4. **動作確認**
5. **本番デプロイ**

---

これで、プロフェッショナルなUIが完成します！🎉


