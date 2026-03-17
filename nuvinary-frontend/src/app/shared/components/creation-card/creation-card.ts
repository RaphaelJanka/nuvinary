import { Component, input, output } from '@angular/core';
import { Creation } from '../../models/creation.model';

@Component({
  selector: 'app-creation-card',
  imports: [],
  templateUrl: './creation-card.html',
})
export class CreationCard {
  readonly creation = input.required<Creation>();
  openDetails = output<Creation>();

  onOpenDetails() {
    if (this.creation().status === 'completed') {
      this.openDetails.emit(this.creation());
    }
  }
}
