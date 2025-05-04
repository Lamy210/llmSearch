FROM oven/bun:latest
WORKDIR /app

# 依存情報のみ先にコピーしてインストール
COPY package.json bunfig.toml ./
RUN bun install

# ソース全体をコピー
COPY . .

EXPOSE 3000 9229

# コンテナ起動後のヘルスチェック
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD curl -f http://localhost:3000/ || exit 1

# ホットリロード + デバッグ用 inspector
CMD ["bun", "run", "src/index.ts", "--watch", "--inspect=0.0.0.0:9229"]
