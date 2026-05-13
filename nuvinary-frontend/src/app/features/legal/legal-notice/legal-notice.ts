import { Component, inject, OnInit, signal } from '@angular/core';
import { LegalService } from '../../services/legal-service';
import { SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-legal-notice',
  imports: [],
  template: `
    <article
      class="prose max-w-4xl prose-slate prose-a:text-blue-500 prose-h1:text-primary"
      [innerHTML]="content()"
    ></article>
  `,
})
export class LegalNotice implements OnInit {
  private readonly legalService = inject(LegalService);
  protected readonly content = signal<SafeHtml>('');
  rawHtml = `
    <h1>Legal Notice</h1>
    <h2>Information according to § 5 DDG</h2>
    <p>
      {{NAME}}<br />
      {{STREET}}<br />
      {{CITY}}
    </p>
    <h2>Contact</h2>
    <p>
      Phone: {{PHONE}}<br />
      Email: {{EMAIL}}
    </p>
    <h2>Person responsible for editorial content</h2>
    <p>
      {{NAME}}<br />
      {{STREET}}<br />
      {{CITY}}
    </p>
  `;

  ngOnInit(): void {
    this.content.set(this.legalService.processContent(this.rawHtml));
  }
}
