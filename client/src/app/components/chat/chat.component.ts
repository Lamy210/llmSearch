import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AppState } from '../../store/state/app.state';
import { Message } from '../../models/message.model';
import { Conversation } from '../../models/conversation.model';
import * as ChatActions from '../../store/actions/chat.actions';
import * as fromChat from '../../store/selectors/chat.selectors';
import { Platform } from '@ionic/angular';
import { NetworkService } from '../../services/network.service';
import { OfflineService } from '../../services/offline.service';
import { VoiceService } from '../../services/voice.service';
import { ShareService } from '../../services/share.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer', { static: false }) messageContainer: ElementRef;
  @ViewChild('messageInput', { static: false }) messageInput: ElementRef;

  conversation$: Observable<Conversation>;
  messages$: Observable<Message[]>;
  isStreaming$: Observable<boolean>;
  isOffline$: Observable<boolean>;

  inputMessage = '';
  conversationId: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private platform: Platform,
    private networkService: NetworkService,
    private offlineService: OfflineService,
    private voiceService: VoiceService,
    private shareService: ShareService
  ) {}

  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id');

    this.conversation$ = this.store.select(fromChat.getCurrentConversation);
    this.messages$ = this.store.select(fromChat.getCurrentMessages);
    this.isStreaming$ = this.store.select(fromChat.isStreaming);
    this.isOffline$ = this.store.select(fromChat.isOfflineMode);

    this.store.dispatch(ChatActions.loadConversation({ id: this.conversationId }));

    this.subscriptions.push(
      this.messages$.subscribe(() => this.scrollToBottom())
    );

    this.subscriptions.push(
      this.networkService.connectionStatus$.subscribe(isOnline => {
        if (isOnline) {
          this.store.dispatch(ChatActions.syncConversation({ id: this.conversationId }));
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  sendMessage() {
    if (!this.inputMessage.trim()) return;

    const message: Partial<Message> = {
      conversationId: this.conversationId,
      content: this.inputMessage,
      role: 'user'
    };

    this.store.dispatch(ChatActions.sendMessage({ message: message as Message }));
    this.inputMessage = '';

    setTimeout(() => {
      this.messageInput.nativeElement.focus();
    }, 0);
  }

  startVoiceInput() {
    if (this.platform.is('cordova')) {
      this.voiceService.startRecognition()
        .then(text => { if (text) this.inputMessage = text; })
        .catch(error => console.error('Voice recognition error:', error));
    }
  }

  shareConversation() {
    this.conversation$.pipe(take(1)).subscribe(conv => {
      this.messages$.pipe(take(1)).subscribe(msgs => {
        const title = conv?.title || 'Chat Conversation';
        const content = msgs.map(m => `${m.role === 'user' ? 'You' : 'Assistant'}: ${m.content}`).join("\n\n");
        this.shareService.share({ title, text: content, dialogTitle: 'Share Conversation' });
      });
    });
  }

  saveOffline() {
    this.store.dispatch(ChatActions.saveConversationOffline({ id: this.conversationId }));
  }

  regenerateMessage(messageId: string) {
    this.store.dispatch(ChatActions.regenerateMessage({ messageId }));
  }

  private scrollToBottom() {
    setTimeout(() => {
      if (this.messageContainer) {
        const el = this.messageContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 100);
  }
}
