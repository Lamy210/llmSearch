import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VoiceService {
  startRecognition(): Promise<string> {
    // 音声認識のダミー実装
    return Promise.resolve('');
  }
}