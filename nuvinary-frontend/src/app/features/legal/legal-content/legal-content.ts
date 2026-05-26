import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { LEGAL_NOTICE_CONTENT } from './legal-notice.content';
import { LegalService } from '../../services/legal-service';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TERMS_OF_SERVICE_CONTENT } from './terms-of-service.content';
import { PRIVACY_CONTENT } from './privacy-policy.content';

const CONTENT_MAP: Record<string, string> = {
  TERMS: TERMS_OF_SERVICE_CONTENT,
  PRIVACY: PRIVACY_CONTENT,
  NOTICE: LEGAL_NOTICE_CONTENT,
};

@Component({
  selector: 'app-legal-content',
  imports: [],
  template: `
    <article
      class="prose max-w-4xl prose-slate prose-a:text-blue-500 prose-h1:text-primary prose-h1:text-2xl prose-h1:xs:text-4xl prose-h2:text-lg prose-h2:xs:text-2xl prose-p:text-sm prose-h3:text-base prose-h3:xs:text-xl prose-h4:text-sm prose-h4:xs:text-lg prose-p:xs:text-base prose-a:break-all prose-a:xs:wrap-break-word"
      [innerHTML]="content()"
    ></article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalContent {
  private readonly legalService = inject(LegalService);
  private readonly route = inject(ActivatedRoute);
  protected readonly content = signal<SafeHtml>('');
  constructor() {
    const key = this.route.snapshot.data['contentKey'] as string;
    const rawHtml = CONTENT_MAP[key] || '';

    this.content.set(this.legalService.processContent(rawHtml));
  }
}
