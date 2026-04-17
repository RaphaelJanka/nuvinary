import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, Signal } from '@angular/core';
import { Creation } from '../../../models/creation.model';
import { LucideAngularModule, Plus, X } from 'lucide-angular';

@Component({
  selector: 'app-studio-dialog',
  imports: [LucideAngularModule],
  template: `
    <section
      class="flex flex-col bg-page-bg rounded-4xl w-full max-w-5xl h-full max-h-[80vh] overflow-hidden shadow-2xl"
    >
      <header class="flex items-center justify-between p-6 border-b border-zinc-500/20">
        <h1 class=" font-black text-3xl text-text-main tracking-tight">Select Asset</h1>
        <button
          (click)="onClose()"
          class="p-2 rounded-full border border-zinc-200 bg-white/80 shadow-sm backdrop-blur-md transition-colors group hover:bg-zinc-100"
        >
          <lucide-icon
            [img]="icons.closeIcon"
            class="w-5 h-5 text-zinc-500 transition-transform duration-300 group-hover:rotate-90 group-hover:text-text-main"
          ></lucide-icon>
        </button>
      </header>

      <main class="flex-1 overflow-y-auto px-6 py-10 bg-white/30 custom-scrollbar">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          @for (creation of creationList(); track creation.id) {
            <button
              (click)="onSelect(creation)"
              class="group relative aspect-4/5 overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:border-brand/50 hover:scale-[0.98] shadow-xl"
            >
              <img
                [src]="creation.url"
                [alt]="creation.title"
                class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div
                class="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <div
                  class="bg-text-main text-zinc-800 p-2 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                >
                  <lucide-icon [img]="icons.plusIcon" class="w-5 h-5"></lucide-icon>
                </div>
              </div>
            </button>
          }
        </div>
      </main>
    </section>
  `,
})
export class StudioDialog {
  protected readonly creationList = inject<Signal<Creation[]>>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);

  onClose() {
    this.dialogRef.close();
  }

  protected readonly icons = {
    plusIcon: Plus,
    closeIcon: X,
  };

  onSelect(creation: Creation) {
    this.dialogRef.close(creation);
  }
}
