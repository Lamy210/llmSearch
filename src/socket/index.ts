/**
 * @file src/socket/index.ts
 *
 * WebSocketサーバーセットアップ
 */
import { WebSocketServer } from 'ws';
import { MessageHandler } from './message-handler.js';
import { ConnectionManager } from './connection-manager.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/config.js';

export function setupWebSocketHandlers() {
  const port = Number(process.env.WS_PORT || 3001);
  const wss = new WebSocketServer({ port });
  const connections = new ConnectionManager();
  const handler = new MessageHandler();

  wss.on('connection', (ws, req) => {
    // URLからtoken取得
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    let userId: string;
    let deviceId: string;
    try {
      if (!token) throw new Error('No token');
      const decoded: any = jwt.verify(token, JWT_SECRET);
      userId = decoded.sub;
      deviceId = decoded.deviceId;
      connections.trackConnection(userId, deviceId, 'online');
      ws.send(JSON.stringify({ type: 'auth_success', data: { userId } }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'auth_error', error: 'Invalid token' }));
      ws.close();
      return;
    }

    ws.on('message', async (data) => {
      try {
        const msg = JSON.parse(data.toString());
        switch (msg.type) {
          case 'chat':
            await handler.handleChatMessage(ws, msg.data, userId);
            break;
          case 'sync':
            await handler.handleSyncRequest(ws, msg.data, userId, deviceId);
            break;
          case 'connection_state':
            await handler.handleConnectionStateUpdate(ws, msg.data, userId, deviceId);
            break;
          default:
            ws.send(JSON.stringify({ type: 'error', error: 'Unknown message type' }));
        }
      } catch (e) {
        ws.send(JSON.stringify({ type: 'error', error: 'Failed to process message' }));
      }
    });

    ws.on('close', () => {
      connections.trackConnection(userId, deviceId, 'offline');
    });
  });

  console.log(`WebSocket server running on ws://localhost:${port}`);
}
