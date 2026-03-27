import { Component, inject, input } from '@angular/core';
import { Creation } from '../../models/creation.model';
import { DialogService } from '../../services/dialog-service';

@Component({
  selector: 'app-creation-card',
  imports: [],
  templateUrl: './creation-card.html',
})
export class CreationCard {
  private readonly dialogService = inject(DialogService);
  readonly creation = input.required<Creation>();

  protected onOpenDetailsDialog() {
    if (this.creation().status === 'completed') {
      this.dialogService.openCreationDetails(this.creation());
    }
  }
}
