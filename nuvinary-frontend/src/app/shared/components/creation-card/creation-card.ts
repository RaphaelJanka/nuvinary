import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
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

  /** Hide the image until fully loaded to avoid the PNG top-to-bottom paint-in. */
  protected readonly isImageLoaded = signal(false);

  protected onOpenDetailsDialog() {
    this.dialogService.openCreationDetails(this.creation());
  }

  protected onImageLoad() {
    this.isImageLoaded.set(true);
  }

  /** Presigned URL likely expired — refresh the list. */
  protected onImageError() {
    this.creationService.loadUserCreations();
  }
}
