import { Component, inject, OnInit, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PRIVACY_HTML_CONTENT } from './privacy-policy.content';
import { PRIVATE_CONFIG } from '../legal-privacy-data';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  template: `
    <div class="flex justify-center p-4">
      <article
        class="prose max-w-4xl rounded-xl p-8 shadow-md bg-white prose-slate prose-a:text-blue-500 prose-h1:text-text-main"
        [innerHTML]="privacyHtml()"
      ></article>
    </div>
  `,
})
export class PrivacyPolicy implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly privacyHtml = signal<SafeHtml>('');

  ngOnInit(): void {
    let processedHtml = PRIVACY_HTML_CONTENT;
    const keys = ['NAME', 'STREET', 'CITY', 'PHONE', 'EMAIL'] as const;
    keys.forEach((key) => {
      processedHtml = processedHtml.replaceAll(
        `{{${key}}}`,
        this.decodeBase64(PRIVATE_CONFIG[key]),
      );
    });
    this.privacyHtml.set(this.sanitizer.bypassSecurityTrustHtml(processedHtml));
  }

  private decodeBase64(encoded: string): string {
    if (!encoded) return 'Datenfehler';
    try {
      const binaryString = atob(encoded);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      console.error('Dekodierungsfehler:', e);
      return 'Datenfehler';
    }
  }
}
