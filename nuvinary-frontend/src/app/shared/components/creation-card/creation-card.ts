import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { Creation } from '../../models/creation.model';
import { DialogService } from '../../services/dialog-service';
import { CreationService } from '../../../features/services/creation-service';
import { Loader } from '../loader/loader';

@Component({
  selector: 'app-creation-card',
  imports: [Loader],
  templateUrl: './creation-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationCard {
  private readonly dialogService = inject(DialogService);
  private readonly creationService = inject(CreationService);
  readonly creation = input.required<Creation>();
  /** Which list this card was rendered from, so `onImageError` refreshes the right one. */
  readonly source = input.required<'own' | 'community'>();

  /** Hide the image until fully loaded to avoid the PNG top-to-bottom paint-in. */
  protected readonly isImageLoaded = signal(false);

  protected onOpenDetailsDialog() {
    this.dialogService.openCreationDetails(this.creation());
  }

  protected onImageLoad() {
    this.isImageLoaded.set(true);
  }

  /** Presigned URL likely expired — refresh whichever list this card belongs to. */
  protected onImageError() {
    if (this.source() === 'own') {
      this.creationService.loadUserCreations();
    } else {
      this.creationService.loadCommunityCreations();
    }
  }
}
