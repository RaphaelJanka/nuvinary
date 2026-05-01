import { Component, inject, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { PRIVACY_HTML_CONTENT } from './privacy-policy.content';
import { LegalService } from '../../dashboard/services/legal-service';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  template: `
    <div class="flex justify-center p-4">
      <article
        class="prose max-w-4xl rounded-xl p-8 shadow-md bg-white prose-slate prose-a:text-blue-500 prose-h1:text-text-main"
        [innerHTML]="content()"
      ></article>
    </div>
  `,
})
export class PrivacyPolicy implements OnInit {
  private readonly legalService = inject(LegalService);
  protected readonly content = signal<SafeHtml>('');

  ngOnInit(): void {
    this.content.set(this.legalService.processContent(PRIVACY_HTML_CONTENT));
  }
}
