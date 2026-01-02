# OpenAI APIによる書類画像認識機能の実装

このドキュメントでは、OpenAI APIを使用した営業許可証などの書類画像認識機能の実装について説明します。

## 概要

出店者がアップロードした書類画像（営業許可証、車検証、自賠責保険、PL保険）を、OpenAIのVision API（GPT-4o）を使用して自動認識し、重要な情報を抽出します。

## 実装内容

### 1. APIエンドポイント

**パス**: `store/app/api/ocr/recognize-document/route.ts`

- 画像URLを受け取り、OpenAI Vision APIで解析
- ドキュメントタイプに応じたプロンプトで情報抽出
- JSON形式で認識結果を返却

### 2. コンポーネント

#### DocumentRecognizer
**パス**: `store/app/components/DocumentRecognizer.tsx`

- 画像認識ボタンを表示
- 認識処理の実行
- 認識結果の表示

#### ImageUpload（更新）
**パス**: `store/app/components/ImageUpload.tsx`

- OCR機能を統合
- `enableOCR`プロップで有効化
- `documentType`で書類タイプを指定

### 3. 使用方法

#### RegistrationFormでの使用例

```tsx
<ImageUpload
  label="営業許可証"
  onFileSelect={(file) => handleImageSelect('businessLicenseImage', file)}
  enableOCR={true}
  documentType="businessLicense"
  onRecognized={(data) => {
    console.log('認識結果:', data);
    // 認識結果を処理
  }}
/>
```

## 対応書類タイプ

1. **businessLicense** - 営業許可証
2. **vehicleInspection** - 車検証
3. **automobileInspection** - 自賠責保険
4. **plInsurance** - PL保険

## 認識される情報

### 営業許可証
- 許可証番号
- 事業者名
- 所在地
- 許可年月日
- 有効期限（あれば）
- その他の重要な情報

### 車検証
- 車両番号（ナンバープレート）
- 車種
- 車検有効期限
- 所有者名
- その他の重要な情報

### 自賠責保険
- 保険証券番号
- 車両番号
- 保険期間
- 保険会社名
- その他の重要な情報

### PL保険
- 保険証券番号
- 保険期間
- 保険会社名
- 補償内容
- その他の重要な情報

## セットアップ

### 1. 依存関係のインストール

```bash
cd store
npm install openai
```

### 2. 環境変数の設定

`.env.local`に以下を追加：

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. API Keyの取得

1. [OpenAI Platform](https://platform.openai.com/)にアクセス
2. API keysセクションで新しいキーを作成
3. キーをコピーして環境変数に設定

## 使用方法

### 出店者側

1. 書類アップロード画面で画像を選択
2. 画像がアップロードされると「🔍 [書類名]を認識」ボタンが表示
3. ボタンをクリックして認識処理を開始
4. 認識結果が表示される（JSON形式）

### 主催者側

1. 申し込み管理画面で出店者の書類画像を確認
2. （将来的に）認識結果を自動表示する機能を追加可能

## カスタマイズ

### プロンプトの変更

`store/app/api/ocr/recognize-document/route.ts`の`prompts`オブジェクトを編集：

```typescript
const prompts: Record<string, string> = {
  businessLicense: `カスタムプロンプト...`,
  // ...
};
```

### 認識結果の処理

`onRecognized`コールバックで認識結果を処理：

```tsx
onRecognized={(data) => {
  // データベースに保存
  // フォームに自動入力
  // バリデーション
  // など
}}
```

## エラーハンドリング

- API Keyが設定されていない場合: エラーメッセージを表示
- 画像が取得できない場合: エラーメッセージを表示
- OpenAI APIエラー: エラーメッセージと詳細を表示

## 料金

- **モデル**: gpt-4o
- **料金**: 入力 $2.50 / 1M tokens、出力 $10.00 / 1M tokens
- **1回あたりのコスト**: 約 $0.01-0.02（画像1枚あたり）

## セキュリティ

- API Keyはサーバーサイドでのみ使用
- 環境変数で管理（`.env.local`はGitにコミットしない）
- 画像URLはSupabase Storageから取得（認証済み）

## 今後の拡張

1. **認識結果の自動保存**: データベースに認識結果を保存
2. **フォーム自動入力**: 認識結果をフォームに自動入力
3. **バリデーション**: 認識結果の妥当性チェック
4. **主催者側での確認**: 主催者が認識結果を確認できる機能
5. **複数書類の一括認識**: 複数の書類を一度に認識

## トラブルシューティング

### 認識が失敗する

- 画像の品質を確認（解像度、明るさ、コントラスト）
- 画像が正しくアップロードされているか確認
- API Keyが有効か確認
- OpenAI Platformで使用量とクォータを確認

### 認識精度が低い

- プロンプトを改善
- より高解像度の画像を使用
- 画像の前処理（トリミング、回転など）を追加

## 参考リンク

- [OpenAI Vision API ドキュメント](https://platform.openai.com/docs/guides/vision)
- [GPT-4o モデル情報](https://platform.openai.com/docs/models/gpt-4o)


