import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="shrink-0 px-4 py-6">
      <div
        class="flex flex-wrap justify-center gap-x-8 gap-y-2 font-medium text-[10px] text-text/40 uppercase tracking-widest"
      >
        @for (item of legalItems; track item.label) {
          <a [routerLink]="item.route" class="transition-colors hover:text-brand">
            {{ item.label }}
          </a>
        }
        <p class="font-bold">© {{ currentYear }} Nuvinary</p>
      </div>
    </footer>
  `,
})
export class Footer {
  currentYear = new Date().getFullYear();

  protected readonly legalItems = [
    { label: 'Legal Notice', route: '/legal/legal-notice' },
    { label: 'Privacy Policy', route: '/legal/privacy-policy' },
    { label: 'Terms of Service', route: '/legal/terms-of-service' },
    { label: 'Contact Support', route: '/legal/contact-support' },
  ];
}
