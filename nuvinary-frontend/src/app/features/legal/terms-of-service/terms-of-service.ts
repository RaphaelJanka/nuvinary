import { Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TERMS_OF_SERVICE_CONTENT } from './terms-of-service.content';

@Component({
  selector: 'app-terms-of-service',
  imports: [],
  template: `
    <div class="flex justify-center p-4">
      <article
        class="prose max-w-4xl rounded-xl p-8 shadow-md bg-white prose-slate prose-a:text-blue-500 prose-h1:text-text-main"
        [innerHTML]="termsHtml()"
      ></article>
    </div>
  `,
})
export class TermsOfService {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly termsHtml = signal<SafeHtml>(
    this.sanitizer.bypassSecurityTrustHtml(TERMS_OF_SERVICE_CONTENT),
  );
}
