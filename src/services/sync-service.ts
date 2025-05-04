/**
 * @file src/services/sync-service.ts
 *
 * 同期サービス
 *
 * 機能:
 * - クライアントからの最終同期以降の更新取得
 *
 * 依存関係:
 * - bun:sqlite
 */
import { Database } from 'bun:sqlite';

export interface SyncPackage {
  conversations: any[];
  messages: any[];
  syncTimestamp: number;
}

export class SyncService {
  private db: Database;

  constructor(dbPath: string = 'data/app.db') {
    this.db = new Database(dbPath);
  }

  /**
   * 最終同期以降の更新を取得
   */
  async getUpdates(userId: string, deviceId: string, lastSyncTimestamp: number): Promise<SyncPackage> {
    // 会話更新取得
    let convSql = `SELECT * FROM conversations WHERE user_id = ? AND updated_at > ? ORDER BY updated_at DESC`;
    // 型エラー回避のため any にキャスト
    const convRows = (this.db as any).query(convSql, userId, lastSyncTimestamp).all() as any[];

    // メッセージ更新取得
    const convIds = convRows.map(r => r.id);
    let msgRows: any[] = [];
    if (convIds.length > 0) {
      // プレースホルダー生成
      const placeholders = convIds.map(_ => '?').join(',');
      const msgSql = `SELECT * FROM messages WHERE conversation_id IN (${placeholders}) AND timestamp > ? ORDER BY timestamp ASC`;
      // 型エラー回避のため any にキャスト
      msgRows = (this.db as any).query(msgSql, ...convIds, lastSyncTimestamp).all() as any[];
    }

    const syncTimestamp = Date.now();
    return { conversations: convRows, messages: msgRows, syncTimestamp };
  }
}