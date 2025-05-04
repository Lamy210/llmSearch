/**
 * @file client/src/app/store/effects/chat.effects.ts
 *
 * チャット機能のNgRxエフェクト
 *
 * 機能:
 * - メッセージ送信・受信の副作用処理
 * - WebSocketイベントのディスパッチ
 * - API呼び出しとレスポンス処理
 * - 同期処理とオフライン保存
 *
 * 依存関係:
 * - @ngrx/effects
 * - websocket.service
 * - api.service
 * - offline.service
 */
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as ChatActions from '../actions/chat.actions';
import { ApiService } from '../../services/api.service';
import { WebSocketService } from '../../services/websocket.service';
import { OfflineService } from '../../services/offline.service';
import { Store } from '@ngrx/store';
import { AppState } from '../state/app.state';
import * as fromChat from '../selectors/chat.selectors';
import { mergeMap, map, catchError, tap, withLatestFrom } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class ChatEffects {
  constructor(
    private actions$: Actions,
    private apiService: ApiService,
    private wsService: WebSocketService,
    private offlineService: OfflineService,
    private store: Store<AppState>
  ) {
    // WS受信メッセージをストアにディスパッチ
    this.wsService.getMessages().subscribe(msg => {
      switch (msg.type) {
        case 'chat_response':
          this.store.dispatch(ChatActions.messageReceived({ message: msg.data }));
          break;
        case 'sync_response':
          this.store.dispatch(ChatActions.syncConversationSuccess({ data: msg.data }));
          break;
      }
    });
  }

  loadConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.loadConversation),
      mergeMap(({ id }) =>
        this.apiService.getConversation(id).pipe(
          map(conversation => ChatActions.loadConversationSuccess({ conversation })),
          catchError(error => of(ChatActions.loadConversationFailure({ error })))
        )
      )
    )
  );

  sendMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.sendMessage),
        tap(({ message }) => {
          this.wsService.sendMessage({ type: 'chat', data: message });
        })
      ),
    { dispatch: false }
  );

  syncConversation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChatActions.syncConversation),
      withLatestFrom(this.store.select(fromChat.getLastSyncTime)),
      mergeMap(([{ id }, lastSync]) =>
        this.apiService.sync(id, lastSync || 0).pipe(
          map(data => ChatActions.syncConversationSuccess({ data })),
          catchError(error => of(ChatActions.syncConversationFailure({ error })))
        )
      )
    )
  );

  saveOffline$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.saveConversationOffline),
        withLatestFrom(this.store.select(fromChat.getCurrentConversation), this.store.select(fromChat.getCurrentMessages)),
        tap(([{ id }, conversation, messages]) => {
          this.offlineService.cacheConversations([conversation]);
          this.offlineService.cacheMessages(id, messages);
        })
      ),
    { dispatch: false }
  );

  regenerateMessage$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ChatActions.regenerateMessage),
        tap(({ messageId }) => {
          this.wsService.sendMessage({ type: 'regenerate', data: { messageId } });
        })
      ),
    { dispatch: false }
  );
}
