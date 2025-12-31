#!/bin/bash

echo "🚀 イベントプラットフォーム セットアップスクリプト"
echo ""

# 色の定義
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 依存関係のインストール
echo "📦 依存関係をインストールしています..."

echo "  - store/ の依存関係をインストール..."
cd store
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "    ✅ 既にインストール済み"
fi
cd ..

echo "  - organizer/ の依存関係をインストール..."
cd organizer
if [ ! -d "node_modules" ]; then
  npm install
else
  echo "    ✅ 既にインストール済み"
fi
cd ..

echo ""
echo "✅ 依存関係のインストールが完了しました"
echo ""

# 環境変数ファイルのチェック
echo "📝 環境変数ファイルを確認しています..."

if [ ! -f "store/.env.local" ]; then
  echo -e "${YELLOW}⚠️  store/.env.local が見つかりません${NC}"
  echo "   以下のコマンドで作成してください:"
  echo "   cd store && cp ../.env.local.example .env.local"
  echo "   または手動で作成してください"
else
  echo -e "${GREEN}✅ store/.env.local が存在します${NC}"
fi

if [ ! -f "organizer/.env.local" ]; then
  echo -e "${YELLOW}⚠️  organizer/.env.local が見つかりません${NC}"
  echo "   以下のコマンドで作成してください:"
  echo "   cd organizer && cp ../.env.local.example .env.local"
  echo "   または手動で作成してください"
else
  echo -e "${GREEN}✅ organizer/.env.local が存在します${NC}"
fi

echo ""
echo "📚 次のステップ:"
echo "   1. 環境変数ファイル（.env.local）を作成"
echo "   2. 実際のAPIキーとURLを設定"
echo "   3. Supabaseデータベースをセットアップ"
echo "   4. アプリを起動: npm run dev"
echo ""
echo "詳細は SETUP.md を参照してください"

