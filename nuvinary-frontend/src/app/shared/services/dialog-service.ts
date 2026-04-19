import { inject, Injectable, signal } from '@angular/core';
import { Creation } from '../models/creation.model';
import { ConfirmDialog } from '../components/dialogs/confirmation-dialog/confirmation-dialog';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CreationService } from '../../features/dashboard/services/creation-service';
import { CollectionService } from '../../features/dashboard/services/collection-service';
import { Collection } from '../../features/dashboard/pages/models/collection.model';
import { CreationDetails } from '../components/creation-details/creation-details';
import { ConfirmDialogData } from '../models/dialog-data.model';
import { StudioDialog } from '../components/dialogs/studio-dialog/studio-dialog';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialog = inject(Dialog);
  private readonly creationService = inject(CreationService);
  private readonly collectionService = inject(CollectionService);

  private readonly _selectedCreation = signal<Creation | null>(null);
  readonly selectedCreation = this._selectedCreation.asReadonly();

  private readonly _studioCardBackground = signal<string>('');
  readonly studioCardBackground = this._studioCardBackground.asReadonly();

  private createDialog(dialogData: ConfirmDialogData): DialogRef<boolean, unknown> {
    return this.dialog.open<boolean>(ConfirmDialog, {
      width: '500px',
      disableClose: true,
      height: '350px',
      data: dialogData,
    });
  }

  openCreationDetails(creation: Creation) {
    const creationSignal = this.creationService.getCreationSignalById(creation);
    this.dialog.open(CreationDetails, {
      data: creationSignal,
      maxWidth: '95vw',
    });
  }

  openConfirmDialogToDeleteCreation(creation: Creation) {
    const data: ConfirmDialogData = {
      title: `Delete "${creation.title}"?`,
      message: `Are you sure? This action is permanent. Since your account is limited to 10 credits, this credit will be gone forever.`,
      type: 'delete',
    };
    const dialogRef = this.createDialog(data);

    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.deleteCreation(creation);
      }
    });
  }

  private deleteCreation(creation: Creation) {
    this.creationService.deleteCreation(creation);
    this.collectionService.removeCreationFromAllCollections(creation.id);
  }

  openConfirmDialogToDeleteCollection(collection: Collection): DialogRef<boolean, unknown> {
    const data: ConfirmDialogData = {
      title: `Delete Collection?`,
      message: `Are you sure you want to delete "${collection.title}"? Don't worry, all your assets inside will stay safe in your gallery.`,
      type: 'delete',
    };
    return this.createDialog(data);
  }

  openStudioDialog() {
    const dialogRef = this.dialog.open<Creation | null>(StudioDialog, {
      disableClose: true,
      maxWidth: '95vw',
      data: this.creationService.userCreationList,
    });

    dialogRef.closed.subscribe((creation) => {
      if (creation) {
        this._selectedCreation.set(creation);
      }
    });
  }

  clearSelectedCreation() {
    this._selectedCreation.set(null);
  }
}
