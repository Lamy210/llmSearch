import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';

export interface ChatState {
  currentConversation: Conversation | null;
  currentMessages: Message[];
  lastSyncTime: number;
  streaming: boolean;
  offline: boolean;
}

export interface AppState {
  chat: ChatState;
}