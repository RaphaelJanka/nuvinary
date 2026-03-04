import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="py-6 px-4 shrink-0">
      <div
        class="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-text-main/40 uppercase tracking-widest"
      >
        <a href="#" class="hover:text-brand transition-colors">Privacy Policy</a>
        <a href="#" class="hover:text-brand transition-colors">Terms of Service</a>
        <a href="#" class="hover:text-brand transition-colors">Contact Support</a>
        <p>© {{ currentYear }} Nuvinary</p>
      </div>
    </footer>
  `,
})
export class Footer {
  currentYear = new Date().getFullYear();
}
