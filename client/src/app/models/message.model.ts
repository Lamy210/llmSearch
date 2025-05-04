export interface Message {
  id?: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  metadata?: any;
  syncStatus?: string;
  version?: number;
}