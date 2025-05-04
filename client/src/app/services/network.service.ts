import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkService {
  private status$ = new BehaviorSubject<boolean>(navigator.onLine);
  public connectionStatus$: Observable<boolean> = this.status$.asObservable();

  constructor() {
    window.addEventListener('online', () => this.status$.next(true));
    window.addEventListener('offline', () => this.status$.next(false));
  }
}