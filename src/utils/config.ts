import dotenv from 'dotenv';

// 環境変数が未設定の場合のみ .env の値を読み込む
dotenv.config({ override: false });

const { JWT_SECRET, USERNAME, PASSWORD, MODEL_API_URL } = process.env;
if (!JWT_SECRET || !USERNAME || !PASSWORD || !MODEL_API_URL) {
  throw new Error('Missing required environment variables');
}

export { JWT_SECRET, USERNAME, PASSWORD, MODEL_API_URL };
