import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PRIVATE_CONFIG } from '../legal/legal-privacy-data';

@Injectable({
  providedIn: 'root',
})
export class LegalService {
  private readonly sanitizer = inject(DomSanitizer);

  private decode(encoded: string): string {
    if (!encoded) return 'Datenfehler';
    try {
      const binaryString = atob(encoded);
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      console.error('Dekodierungsfehler:', e);
      return 'Datenfehler';
    }
  }

  processContent(rawHtml: string): SafeHtml {
    let processed = rawHtml;
    const keys = ['NAME', 'STREET', 'CITY', 'PHONE', 'EMAIL'] as const;

    keys.forEach((key) => {
      processed = processed.replaceAll(`{{${key}}}`, this.decode(PRIVATE_CONFIG[key]));
    });

    return this.sanitizer.bypassSecurityTrustHtml(processed);
  }
}
