import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="shrink-0 px-4 py-6">
      <div
        class="flex flex-wrap justify-center gap-x-8 gap-y-2 font-medium text-[10px] text-text/40 uppercase tracking-widest"
      >
        <a href="#" class="transition-colors hover:text-brand"> Privacy Policy </a>
        <a href="#" class="transition-colors hover:text-brand"> Terms of Service </a>
        <a href="#" class="transition-colors hover:text-brand"> Contact Support </a>

        <p class="font-bold">© {{ currentYear }} Nuvinary</p>
      </div>
    </footer>
  `,
})
export class Footer {
  currentYear = new Date().getFullYear();
}
