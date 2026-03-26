// src/app/shared/components/delete-confirm-dialog/delete-confirm-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideAngularModule, Trash2, TriangleAlert } from 'lucide-angular';

interface DeleteDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="p-8 bg-white rounded-3xl h-full flex flex-col justify-center gap-12 shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-300"
    >
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shadow-inner border border-red-100"
        >
          <lucide-icon [img]="icons.trashIcon" class="w-7 h-7"></lucide-icon>
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-extrabold text-zinc-900 leading-tight">
            {{ data.title }}
          </h3>
          <p
            class="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full inline-block mt-1"
          >
            Permanent Delete
          </p>
        </div>
      </div>

      <p class="text-sm text-zinc-600 leading-relaxed font-medium">
        {{ data.message }}
      </p>

      <div class="flex gap-3">
        <button
          (click)="dialogRef.close(false)"
          class="flex-1 px-5 py-3 text-sm font-bold text-zinc-500 hover:text-zinc-800 transition-colors rounded-xl hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          (click)="dialogRef.close(true)"
          class="flex-1 px-5 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200 active:scale-95"
        >
          Yes, delete
        </button>
      </div>
    </div>
  `,
})
export class DeleteConfirmDialog {
  readonly dialogRef = inject(DialogRef<boolean>);
  readonly data = inject<DeleteDialogData>(DIALOG_DATA);
  readonly icons = { trashIcon: Trash2, alertIcon: TriangleAlert };
}
