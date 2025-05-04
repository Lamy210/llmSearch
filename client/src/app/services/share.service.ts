import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShareService {
  async share(options: { title?: string; text: string; dialogTitle?: string }) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: options.title,
          text: options.text
        });
      } catch (e) {
        console.error('Share failed', e);
      }
    } else {
      console.warn('Web Share API not supported');
    }
  }
}