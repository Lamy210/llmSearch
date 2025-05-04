export interface Conversation {
  id?: string;
  userId: string;
  title: string;
  createdAt?: number;
  updatedAt?: number;
  metadata?: any;
  version?: number;
}