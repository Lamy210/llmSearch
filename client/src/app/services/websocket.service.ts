import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket: WebSocket;
  private messages$ = new Subject<any>();

  connect(token: string): void {
    this.socket = new WebSocket(`ws://localhost:3001?token=${token}`);
    this.socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        this.messages$.next(msg);
      } catch {
        // ignore invalid
      }
    };
  }

  getMessages(): Observable<any> {
    return this.messages$.asObservable();
  }

  sendMessage(msg: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }
}
