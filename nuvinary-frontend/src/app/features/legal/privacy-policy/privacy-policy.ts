import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PRIVACY_HTML_CONTENT } from './privacy-policy.content';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  template: `
    <div class="flex justify-center p-4">
      <article
        class="prose max-w-4xl rounded-xl p-8 shadow-md bg-white prose-slate prose-a:text-blue-500 prose-h1:text-text-main"
        [innerHTML]="safeHtmlContent()"
      ></article>
    </div>
  `,
})
export class PrivacyPolicy {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly safeHtmlContent = signal<SafeHtml>(
    this.sanitizer.bypassSecurityTrustHtml(PRIVACY_HTML_CONTENT),
  );
}
