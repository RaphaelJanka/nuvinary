import { Component, input, output } from '@angular/core';
import { Creation } from '../../models/creation.model';
import { LucideAngularModule, Maximize } from 'lucide-angular';

@Component({
  selector: 'app-creation-card',
  imports: [LucideAngularModule],
  templateUrl: './creation-card.html',
})
export class CreationCard {
  readonly creation = input.required<Creation>();

  openDetails = output<Creation>();

  protected readonly maximizeIcon = Maximize;
}
