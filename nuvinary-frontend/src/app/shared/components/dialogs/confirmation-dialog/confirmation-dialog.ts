// src/app/shared/components/delete-confirm-dialog/delete-confirm-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideAngularModule, Trash2, TriangleAlert } from 'lucide-angular';
import { ConfirmDialogData } from '../../../models/dialog-data.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="flex flex-col justify-center gap-12 h-full p-8 rounded-3xl border border-zinc-100 bg-white shadow-2xl animate-in zoom-in-95 duration-300"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex items-center justify-center w-14 h-14 rounded-2xl border shadow-inner transition-colors"
          [ngClass]="{
            'bg-red-50 text-red-500 border-red-100': data.type === 'delete',
            'bg-text-main/10 text-text-main border-text-main/20': data.type === 'info',
            'bg-amber-50 text-amber-500 border-amber-100': data.type === 'warning',
          }"
        >
          <lucide-icon [img]="icons.trashIcon" class="w-7 h-7"></lucide-icon>
        </div>

        <div class="flex-1">
          <h3 class="font-extrabold text-xl text-zinc-900 leading-tight">
            {{ data.title }}
          </h3>
          <p
            class="inline-block mt-1 px-2 py-0.5 font-black text-[10px] uppercase tracking-wider rounded-full"
            [ngClass]="{
              'text-red-600 bg-red-50': data.type === 'delete',
              'text-text-main bg-text-main/10': data.type === 'info',
              'text-amber-600 bg-amber-50': data.type === 'warning',
            }"
          >
            {{
              data.type === 'delete'
                ? 'Irreversible Action'
                : data.type === 'warning'
                  ? 'Attention Required'
                  : 'Information'
            }}
          </p>
        </div>
      </div>

      <p class="font-medium text-sm text-zinc-600 leading-relaxed">
        {{ data.message }}
      </p>

      <div class="flex gap-3">
        <button
          (click)="dialogRef.close(false)"
          class="flex-1 px-5 py-3 font-bold text-sm text-zinc-500 rounded-xl transition-colors hover:bg-zinc-100 hover:text-zinc-800"
        >
          Cancel
        </button>

        <button
          (click)="dialogRef.close(true)"
          class="flex-1 px-5 py-3 font-bold text-sm text-white rounded-xl shadow-lg transition-all active:scale-95"
          [ngClass]="{
            'bg-red-500 hover:bg-red-600 shadow-red-100': data.type === 'delete',
            'bg-text-main hover:bg-[#6a5ca1] shadow-indigo-100': data.type === 'info',
            'bg-amber-500 hover:bg-amber-600 shadow-amber-100': data.type === 'warning',
          }"
        >
          {{ data.type === 'delete' ? 'Yes, delete' : 'Confirm' }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialog {
  protected readonly dialogRef = inject(DialogRef<boolean>);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly icons = { trashIcon: Trash2, alertIcon: TriangleAlert };
}
