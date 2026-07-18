import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { Creation } from '../../../models/creation.model';

@Component({
  selector: 'app-creation-result-dialog',
  imports: [LucideAngularModule],
  templateUrl: './creation-result-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationResultDialog {
  protected readonly creation = inject<Creation>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
  protected readonly icons = { closeIcon: X };

  onClose() {
    this.dialogRef.close();
  }
}
