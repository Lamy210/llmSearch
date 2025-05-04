#!/bin/bash
# setup.sh - 初期セットアップスクリプト

# カラー表示
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}DeepseekChat セットアップスクリプト${NC}"
echo "================================="

# ...existing code...

# バックエンド依存関係のインストール
echo "バックエンド依存関係をインストールしています..."
# Dockerコンテナ内でbunを使用
docker run --rm -v "$(pwd)":/app -w /app oven/bun:latest bun install

# Angularフロントエンドの初期設定
if [ ! -d client ]; then
  echo "Angularプロジェクトを作成しています..."
  mkdir -p client
  cd client
  
  # Ionic/Angularの初期化
  # Dockerコンテナ内でnpmとIonic CLIを実行
  docker run --rm -v "$(pwd)":/app -w /app node:18 bash -c "npm install -g @ionic/cli && npx ionic start . blank --type=angular --capacitor --no-interactive"
  
  # 必要なパッケージのインストール
  docker run --rm -v "$(pwd)":/app -w /app node:18 npm install @capacitor/core @capacitor/ios @capacitor/android @capacitor/storage @capacitor/network @capacitor/share @ngrx/store @ngrx/effects @ngrx/entity @ngrx/store-devtools @ionic/storage-angular marked ngx-markdown
  
  # Angular クライアント依存のインストール
  cd client
  docker run --rm -v "$(pwd)":/app -w /app node:18 npm install
  cd ..
  
  cd ..
  echo -e "${GREEN}Angularプロジェクトの作成が完了しました${NC}"
else
  echo -e "${GREEN}Angularプロジェクトが既に存在します${NC}"
fi

# client フォルダに移動して常に依存インストール
cd client
# Dockerコンテナ内で bun を使用してホストに node_modules を生成
docker run --rm -v "$(pwd)":/app -w /app oven/bun:latest bun install
cd ..

# ...existing code...