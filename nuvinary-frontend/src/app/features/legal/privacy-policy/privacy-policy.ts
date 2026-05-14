import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { PRIVACY_HTML_CONTENT } from './privacy-policy.content';
import { LegalService } from '../../services/legal-service';

@Component({
  selector: 'app-privacy-policy',
  imports: [],
  template: `
    <article
      class="prose max-w-4xl prose-slate prose-a:text-blue-500 prose-h1:text-primary"
      [innerHTML]="content()"
    ></article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPolicy implements OnInit {
  private readonly legalService = inject(LegalService);
  protected readonly content = signal<SafeHtml>('');

  ngOnInit(): void {
    this.content.set(this.legalService.processContent(PRIVACY_HTML_CONTENT));
  }
}
