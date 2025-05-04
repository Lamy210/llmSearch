/**
 * @file client/src/app/services/api.service.ts
 *
 * バックエンドAPIとの通信サービス
 *
 * 機能:
 * - RESTful API呼び出し
 * - エラーハンドリング
 * - 認証トークン管理
 * - ネットワーク状態対応
 *
 * エンドポイント:
 * - 認証: /auth/*
 * - 会話: /api/conversations/*
 * - メッセージ: /api/messages/*
 * - 同期: /api/sync/*
 *
 * 実装ガイドライン:
 * - HttpClientを使用
 * - RxJSオペレータでレスポンス処理
 * - リトライメカニズムの実装
 * - オフライン対応（キャッシュ、キュー）
 *
 * 依存関係:
 * - @angular/common/http
 * - rxjs
 * - network.service
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { NetworkService } from './network.service';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private networkService: NetworkService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  private handleError(err: any) {
    console.error('API error', err);
    return throwError(() => err.error || 'Server error');
  }

  // 会話一覧取得
  getConversations(): Observable<any> {
    const url = `${this.baseUrl}/api/conversations`;
    return this.http.get(url, { headers: this.getAuthHeaders() }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // 会話作成
  createConversation(title: string): Observable<any> {
    const url = `${this.baseUrl}/api/conversations`;
    return this.http.post(url, { title }, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // 会話詳細取得
  getConversation(id: string): Observable<any> {
    const url = `${this.baseUrl}/api/conversations/${id}`;
    return this.http.get(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // メッセージ送信
  sendMessage(message: any): Observable<any> {
    const url = `${this.baseUrl}/api/messages`;
    return this.http.post(url, message, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }

  // 同期
  sync(conversationId: string, lastSync: number): Observable<any> {
    const url = `${this.baseUrl}/api/sync`;
    return this.http.post(url, { id: conversationId, lastSyncTimestamp: lastSync }, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError)
    );
  }
}
