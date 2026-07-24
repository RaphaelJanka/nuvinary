import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { Creation } from '../../../models/creation.model';
import { LucideAngularModule, Plus, X } from 'lucide-angular';
import { CreationService } from '../../../../features/services/creation-service';

@Component({
  selector: 'app-studio-dialog',
  imports: [LucideAngularModule],
  templateUrl: './studio-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudioDialog {
  protected readonly creationList = inject<Signal<Creation[]>>(DIALOG_DATA);
  protected readonly dialogRef = inject(DialogRef);
  private readonly creationService = inject(CreationService);

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

  /** The presigned image URL may have expired since it was fetched — refresh the list to get a fresh one. */
  protected onImageError() {
    this.creationService.loadUserCreations();
  }
}
