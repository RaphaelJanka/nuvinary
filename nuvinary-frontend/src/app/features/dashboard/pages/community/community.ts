import { Component, inject } from '@angular/core';
import { CreationGrid } from '../../../../shared/components/creation-grid/creation-grid';
import { CreationService } from '../../services/creation-service';

@Component({
  selector: 'app-community',
  imports: [CreationGrid],
  templateUrl: './community.html',
})
export class Community {
  private readonly creationService = inject(CreationService);
  readonly creationList = this.creationService.communityCreationList;
}
