import { createSelector } from '@ngrx/store';
import { AppState } from '../state/app.state';

const selectChat = (state: AppState) => state.chat;

export const getCurrentConversation = createSelector(
  selectChat,
  chat => chat.currentConversation
);
export const getCurrentMessages = createSelector(
  selectChat,
  chat => chat.currentMessages
);
export const isStreaming = createSelector(
  selectChat,
  chat => chat.streaming
);
export const isOfflineMode = createSelector(
  selectChat,
  chat => chat.offline
);
export const getLastSyncTime = createSelector(
  selectChat,
  chat => chat.lastSyncTime
);
