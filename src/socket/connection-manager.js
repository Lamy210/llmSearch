// src/socket/connection-manager.js
export class ConnectionManager {
  constructor() {
    this.connections = new Map();
  }

  // userId, deviceId, state('online'|'offline')を受け取り状態を管理
  trackConnection(userId, deviceId, state) {
    const key = `${userId}:${deviceId}`;
    if (state === 'offline') {
      this.connections.delete(key);
    } else {
      this.connections.set(key, state);
    }
    console.log(`ConnectionManager: ${key} is now ${state}`);
  }
}