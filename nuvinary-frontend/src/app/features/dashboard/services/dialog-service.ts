import { inject, Injectable } from '@angular/core';
import { Creation } from '../../../shared/models/creation.model';
import { ConfirmDialog } from '../../../shared/components/dialogs/confirmation-dialog/confirmation-dialog';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { CreationService } from './creation-service';
import { CollectionService } from './collection-service';
import { Collection } from '../pages/models/collection.model';
import { CreationDetails } from '../../../shared/components/creation-details/creation-details';

export type ConfirmType = 'delete' | 'warning' | 'info';

export interface ConfirmDialogData {
  title: string;
  message: string;
  type: ConfirmType;
}

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  private readonly dialog = inject(Dialog);
  private readonly creationService = inject(CreationService);
  private readonly collectionService = inject(CollectionService);

  createDialog(dialogData: ConfirmDialogData): DialogRef<boolean, unknown> {
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
}
