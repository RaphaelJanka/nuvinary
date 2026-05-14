// src/app/shared/components/delete-confirm-dialog/delete-confirm-dialog.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { LucideAngularModule, Trash2, TriangleAlert } from 'lucide-angular';
import { ConfirmDialogData } from '../../../models/dialog-data.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './confirmation-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly dialogRef = inject(DialogRef<boolean>);
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly icons = { trashIcon: Trash2, alertIcon: TriangleAlert };
}
