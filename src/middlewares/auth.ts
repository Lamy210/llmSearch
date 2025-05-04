/**
 * @file src/middlewares/auth.ts
 *
 * JWT認証ミドルウェア
 *
 * 機能:
 * - Authorizationヘッダーの検証 (Bearerトークン)
 * - トークン検証に成功した場合、userIdとdeviceIdをコンテキストに設定
 * - 認証失敗時は401を返却
 */

import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config.ts';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  const token = authHeader.substring(7);
  try {
    // トークン検証とペイロード取得
    const decoded: any = jwt.verify(token, JWT_SECRET);
    // コンテキストにユーザー情報をセット
    c.set('userId', decoded.sub);
    if (decoded.deviceId) {
      c.set('deviceId', decoded.deviceId);
    }
    await next();
  } catch (err) {
    return c.json({ error: 'Invalid token' }, 401);
  }
}
