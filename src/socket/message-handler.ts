/**
 * @file src/socket/message-handler.ts
 *
 * WebSocketメッセージハンドラー
 *
 * 機能:
 * - chat: チャットメッセージ送信処理
 * - sync: 同期リクエスト処理
 * - connection_state: 接続状態更新
 *
 * ストリーミング処理は非同期fetchでモデルサーバーを呼び出し
 * DB操作にはConversationServiceとSyncServiceを使用
 *
 * 依存関係:
 * - ws (WebSocket)
 * - services/conversation-service
 * - services/sync-service
 */

// Bun環境のglobal fetchを使用
// import fetch from 'node-fetch';
// import { WebSocket } from 'ws';

import { ConversationService } from '../services/conversation-service.js';
import { SyncService } from '../services/sync-service.ts';
import { MODEL_API_URL } from '../utils/config.js';

export class MessageHandler {
  private convService = new ConversationService();
  private syncService = new SyncService();

  // チャットメッセージ送信
  async handleChatMessage(ws: any, data: any, userId: string) {
    const { conversationId, content } = data;
    // ユーザー発言をDBに保存
    await this.convService.create(userId, ''); // タイトル不要の場合は空文字
    // モデルサーバーにリクエスト
    try {
      const res = await fetch(`${MODEL_API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: content })
      });
      const json = await res.json();
      // クライアントへ応答送信
      ws.send(JSON.stringify({
        type: 'chat_response',
        data: { conversationId, answer: json.answer }
      }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', error: 'Generation failed' }));
    }
  }

  // 同期リクエスト処理
  async handleSyncRequest(ws: any, data: any, userId: string, deviceId: string) {
    const { lastSyncTimestamp } = data;
    try {
      const syncPackage = await this.syncService.getUpdates(userId, deviceId, lastSyncTimestamp);
      ws.send(JSON.stringify({ type: 'sync_response', data: syncPackage }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', error: 'Sync failed' }));
    }
  }

  // 接続状態更新
  async handleConnectionStateUpdate(
    ws: any,
    data: any,
    userId: string,
    deviceId: string
  ) {
    const { state } = data; // 'online' | 'offline'
    // 省略: ConnectionManagerで状態を更新
    ws.send(JSON.stringify({ type: 'connection_state_ack', data: { state } }));
  }
}
