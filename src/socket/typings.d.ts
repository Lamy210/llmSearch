declare module 'ws' {
  export class WebSocketServer {
    constructor(options: any);
    on(event: string, callback: (...args: any[]) => void): void;
  }
}

declare module './connection-manager.js' {
  export class ConnectionManager {
    trackConnection(userId: string, deviceId: string, state: string): void;
  }
}
