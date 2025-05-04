import { createAction, props } from '@ngrx/store';
import { Conversation } from '../../models/conversation.model';
import { Message } from '../../models/message.model';

export const loadConversation = createAction(
  '[Chat] Load Conversation',
  props<{ id: string }>()
);
export const loadConversationSuccess = createAction(
  '[Chat] Load Conversation Success',
  props<{ conversation: Conversation }>()
);
export const loadConversationFailure = createAction(
  '[Chat] Load Conversation Failure',
  props<{ error: string }>()
);

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ message: Message }>()
);
export const sendMessageSuccess = createAction(
  '[Chat] Send Message Success',
  props<{ message: any }>()
);
export const sendMessageFailure = createAction(
  '[Chat] Send Message Failure',
  props<{ error: string }>()
);

export const messageReceived = createAction(
  '[Chat] Message Received',
  props<{ message: any }>()
);

export const syncConversation = createAction(
  '[Chat] Sync Conversation',
  props<{ id: string }>()
);
export const syncConversationSuccess = createAction(
  '[Chat] Sync Conversation Success',
  props<{ data: any }>()
);
export const syncConversationFailure = createAction(
  '[Chat] Sync Conversation Failure',
  props<{ error: string }>()
);

export const saveConversationOffline = createAction(
  '[Chat] Save Conversation Offline',
  props<{ id: string }>()
);

export const regenerateMessage = createAction(
  '[Chat] Regenerate Message',
  props<{ messageId: string }>()
);
