/**
 * @file src/services/conversation-service.ts
 *
 * 会話管理サービス
 *
 * 機能:
 * - 会話の作成、読み取り、更新、削除
 * - 会話メタデータの管理
 * - メッセージの関連付けと取得
 * - ページネーションと同期サポート
 *
 * データベース操作:
 * - SQLiteを使用した永続化
 * - トランザクション管理
 * - インデックス最適化
 *
 * 実装ガイドライン:
 * - データベース操作は非同期で行う
 * - エラーハンドリングを適切に実装
 * - ユーザーIDによるデータ分離
 * - バージョニングによる同期サポート
 *
 * 依存関係:
 * - bun:sqlite
 * - uuid
 */
import { Database } from 'bun:sqlite';
// UUID生成は組み込みcryptoを使用
// import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, any>;
  version: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
  syncStatus?: string;
  version: number;
}

export class ConversationService {
  private db: Database;

  constructor(dbPath: string = 'data/app.db') {
    this.db = new Database(dbPath);
    this.initSchema();
  }

  private initSchema() {
    // 会話テーブル作成
    this.db.run(
      `CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        metadata TEXT,
        version INTEGER NOT NULL
      )`
    );
    // インデックス追加
    this.db.run(`CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(user_id)`);
  }

  // ユーザーごとの会話一覧取得
  async listByUser(
    userId: string,
    limit: number,
    offset: number,
    syncAfter?: number
  ): Promise<Conversation[]> {
    const params: any[] = [userId];
    let sql = `SELECT * FROM conversations WHERE user_id = ?`;
    if (syncAfter !== undefined) {
      sql += ` AND updated_at > ?`;
      params.push(syncAfter);
    }
    sql += ` ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    // 型エラー回避のため any にキャスト
    const rows = (this.db as any).query(sql, ...params).all() as any[];
    return rows.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      metadata: r.metadata ? JSON.parse(r.metadata) : undefined,
      version: r.version
    }));
  }

  // 新規会話作成
  async create(
    userId: string,
    title: string,
    metadata?: Record<string, any>
  ): Promise<Conversation> {
    const id = crypto.randomUUID();
    const now = Date.now();
    const version = 1;
    // 型エラー回避のため any にキャスト
    (this.db as any).run(
      `INSERT INTO conversations (id, user_id, title, created_at, updated_at, metadata, version)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      id, userId, title, now, now, metadata ? JSON.stringify(metadata) : null, version
    );
    return { id, userId, title, createdAt: now, updatedAt: now, metadata, version };
  }

  // 会話詳細取得 (メッセージ含むオプション)
  async getById(
    id: string,
    userId: string,
    includeMessages: boolean = false,
    messagesAfter?: number
  ): Promise<any | null> {
    // 型エラー回避のため any にキャスト
    const allRows = (this.db as any).query(
      `SELECT * FROM conversations WHERE id = ? AND user_id = ?`,
      id, userId
    ).all() as any[];
    const row = allRows[0];
    if (!row) return null;

    const conv: any = {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      version: row.version
    };

    if (includeMessages) {
      let msgSql = `SELECT * FROM messages WHERE conversation_id = ?`;
      const params: any[] = [id];
      if (messagesAfter !== undefined) {
        msgSql += ` AND timestamp > ?`;
        params.push(messagesAfter);
      }
      msgSql += ` ORDER BY timestamp ASC`;
      // 型エラー回避のため any にキャスト
      const messages = (this.db as any).query(msgSql, ...params).all() as any[];
      conv.messages = messages.map((m: any) => ({
        id: m.id,
        conversationId: m.conversation_id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
        metadata: m.metadata ? JSON.parse(m.metadata) : undefined,
        syncStatus: m.sync_status,
        version: m.version
      }));
    }

    return conv;
  }

  // 会話更新 (タイトル・メタデータ)
  async update(
    id: string,
    userId: string,
    title?: string,
    metadata?: Record<string, any>
  ): Promise<Conversation | null> {
    const existing = await this.getById(id, userId);
    if (!existing) return null;
    const now = Date.now();
    const newVersion = existing.version + 1;
    // 型エラー回避のため any にキャスト
    (this.db as any).run(
      `UPDATE conversations SET title = ?, metadata = ?, updated_at = ?, version = ?
       WHERE id = ? AND user_id = ?`,
      title ?? existing.title,
      metadata ? JSON.stringify(metadata) : existing.metadata ? JSON.stringify(existing.metadata) : null,
      now,
      newVersion,
      id,
      userId
    );
    return { ...existing, title: title ?? existing.title, metadata: metadata ?? existing.metadata, updatedAt: now, version: newVersion };
  }

  // 会話削除
  async delete(id: string, userId: string): Promise<boolean> {
    // 型エラー回避のため any にキャスト
    const { changes } = (this.db as any).run(
      `DELETE FROM conversations WHERE id = ? AND user_id = ?`,
      id, userId
    );
    return changes > 0;
  }
}
