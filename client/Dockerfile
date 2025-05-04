# client/Dockerfile
FROM oven/bun:latest
WORKDIR /app

# 依存情報のみ先にコピーしてインストール
COPY package.json ./
RUN bun install
# グローバルで Ionic CLI をインストール
RUN bun add --global @ionic/cli
# ps コマンドを提供 (プロセスツリー操作用)
RUN apt-get update && apt-get install -y procps

# ソース全体をコピー
COPY . .

EXPOSE 8100
# 開発サーバー起動 (bunでnpmスクリプトを実行)
CMD ["bun", "run", "start"]