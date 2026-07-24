import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Creation } from '../../models/creation.model';
import { DialogService } from '../../services/dialog-service';
import { CreationService } from '../../../features/services/creation-service';

@Component({
  selector: 'app-creation-card',
  imports: [],
  templateUrl: './creation-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationCard {
  private readonly dialogService = inject(DialogService);
  private readonly creationService = inject(CreationService);
  readonly creation = input.required<Creation>();

  protected onOpenDetailsDialog() {
    this.dialogService.openCreationDetails(this.creation());
  }

  /** The presigned image URL may have expired since it was fetched — refresh the list to get a fresh one. */
  protected onImageError() {
    this.creationService.loadUserCreations();
  }
}
