import { Injectable } from '@angular/core';
import { Conversation } from '../models/conversation.model';
import { Message } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class OfflineService {
  private convKey = 'offline_conversations';

  cacheConversations(convs: Conversation[]): void {
    localStorage.setItem(this.convKey, JSON.stringify(convs));
  }

  getCachedConversations(): Conversation[] | null {
    const json = localStorage.getItem(this.convKey);
    return json ? JSON.parse(json) : null;
  }

  cacheMessages(convId: string, msgs: Message[]): void {
    localStorage.setItem(`offline_msgs_${convId}`, JSON.stringify(msgs));
  }

  getCachedMessages(convId: string): Message[] | null {
    const json = localStorage.getItem(`offline_msgs_${convId}`);
    return json ? JSON.parse(json) : null;
  }
}