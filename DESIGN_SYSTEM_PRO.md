# プロフェッショナルデザインシステム

参考: Stripe, Linear, Vercel, Notion

## 🎨 カラーパレット

### グレースケール（メイン90%）
```
gray-50:  #F9FAFB
gray-100: #F3F4F6
gray-200: #E5E7EB
gray-300: #D1D5DB
gray-400: #9CA3AF
gray-500: #6B7280
gray-600: #4B5563
gray-700: #374151
gray-800: #1F2937
gray-900: #111827
```

### アクセントカラー（控えめ10%）
```
Store:     #0EA5E9 (sky-500) - 信頼感
Organizer: #F97316 (orange-500) - エネルギー
Admin:     #6366F1 (indigo-500) - 権威
```

### 使用ルール
- 背景: white, gray-50
- ボーダー: gray-200, gray-300
- テキスト: gray-900 (main), gray-600 (secondary), gray-500 (tertiary)
- アクセント: 最小限（CTA、リンク、ステータス）

## 📐 タイポグラフィ

### フォントサイズ
```
text-xs:   12px (補助テキスト)
text-sm:   14px (説明文)
text-base: 16px (本文)
text-lg:   18px (小見出し)
text-xl:   20px (見出し)
text-2xl:  24px (大見出し)
text-3xl:  30px (ページタイトル)
text-4xl:  36px (ヒーロー)
```

### フォントウェイト
```
font-normal:   400 (本文)
font-medium:   500 (強調)
font-semibold: 600 (見出し)
font-bold:     700 (タイトル)
```

### 行間
```
leading-tight:  1.25 (タイトル)
leading-normal: 1.5  (本文)
leading-relaxed: 1.625 (長文)
```

## 📏 間隔システム（8pxベース）

```
spacing-1:  4px
spacing-2:  8px
spacing-3:  12px
spacing-4:  16px
spacing-5:  20px
spacing-6:  24px
spacing-8:  32px
spacing-10: 40px
spacing-12: 48px
spacing-16: 64px
spacing-20: 80px
spacing-24: 96px
```

### 使用ガイド
- コンポーネント内: 16-24px
- コンポーネント間: 24-32px
- セクション間: 48-64px
- ページ上下: 80-96px

## 🎴 カードデザイン

```css
background: white
border: 1px solid gray-200
border-radius: 12px
padding: 24px (sm), 32px (lg)
shadow: 0 1px 3px rgba(0,0,0,0.1)
hover-shadow: 0 4px 6px rgba(0,0,0,0.07)
transition: 150ms ease
```

## 🔘 ボタンデザイン

### Primary
```css
background: accent-color
color: white
height: 40px (base), 48px (lg)
padding: 0 24px
border-radius: 8px
font-weight: 500
shadow: none
hover: brightness(0.9)
transition: 150ms ease
```

### Secondary
```css
background: white
color: gray-700
border: 1px solid gray-300
height: 40px (base), 48px (lg)
padding: 0 24px
border-radius: 8px
font-weight: 500
hover: background gray-50
transition: 150ms ease
```

### Ghost
```css
background: transparent
color: gray-600
hover: background gray-100
```

## 📋 フォームデザイン

### Input
```css
height: 40px
padding: 0 16px
border: 1px solid gray-300
border-radius: 8px
font-size: 14px
placeholder: gray-400
focus: border accent-color, ring-2 accent-color/10
transition: 150ms ease
```

### Label
```css
font-size: 14px
font-weight: 500
color: gray-700
margin-bottom: 8px
```

## 🌊 シャドウ

```css
sm:      0 1px 2px rgba(0,0,0,0.05)
DEFAULT: 0 1px 3px rgba(0,0,0,0.1)
md:      0 4px 6px rgba(0,0,0,0.07)
lg:      0 10px 15px rgba(0,0,0,0.1)
xl:      0 20px 25px rgba(0,0,0,0.1)
```

**使用ルール**: 最小限に。カードはdefault、モーダルはlg、ドロップダウンはmd

## 🎬 アニメーション

```css
duration: 150ms (default), 200ms (complex)
timing: ease, ease-in-out
```

### 許可される効果
- opacity変化
- transform (scale: 0.98-1.02のみ)
- border-color変化
- background-color変化

### 禁止
- 派手なグラデーション
- 大きなスケール変化
- 回転アニメーション
- バウンス効果

## 🚫 禁止事項

1. **絵文字** - 完全禁止（✓ ✕ ⚠️ 🎉 など）
2. **グラデーション背景** - 禁止（ボタン・カードなど）
3. **過剰なシャドウ** - shadow-2xl, shadow-3xl禁止
4. **派手なアニメーション** - pulse, bounce, spin（ローディング以外）禁止
5. **カラフルな背景** - 背景は白かgray-50のみ
6. **大きな角丸** - rounded-3xl以上禁止
7. **太いボーダー** - border-4以上禁止

## ✅ 目指すべきレベル

- **Stripe**: シンプル、信頼感、余白
- **Linear**: ミニマル、スピード感、機能美
- **Vercel**: モダン、洗練、統一感
- **Notion**: 使いやすさ、直感的、整理

## 📊 実装優先順位

1. ✅ デザインシステム定義
2. → WelcomeScreen（3アプリ）
3. → Dashboard（3アプリ）
4. → カードコンポーネント
5. → フォーム
6. → その他画面

