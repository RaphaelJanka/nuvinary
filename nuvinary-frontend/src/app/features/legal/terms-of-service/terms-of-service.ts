import { Component, inject, signal } from '@angular/core';
import { SafeHtml } from '@angular/platform-browser';
import { TERMS_OF_SERVICE_CONTENT } from './terms-of-service.content';
import { LegalService } from '../../services/legal-service';

@Component({
  selector: 'app-terms-of-service',
  imports: [],
  template: `
    <article
      class="prose max-w-4xl prose-slate prose-a:text-blue-500 prose-h1:text-text-main"
      [innerHTML]="termsHtml()"
    ></article>
  `,
})
export class TermsOfService {
  private readonly legalService = inject(LegalService);
  protected readonly termsHtml = signal<SafeHtml>(
    this.legalService.processContent(TERMS_OF_SERVICE_CONTENT),
  );
}
