import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject, Signal } from '@angular/core';
import { Creation } from '../../../models/creation.model';
import { LucideAngularModule, Plus, X } from 'lucide-angular';

@Component({
  selector: 'app-studio-dialog',
  imports: [LucideAngularModule],
  templateUrl: './studio-dialog.html',
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
