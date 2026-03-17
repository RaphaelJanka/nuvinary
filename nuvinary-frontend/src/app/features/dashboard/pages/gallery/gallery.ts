import { Component, inject } from '@angular/core';
import { CreationService } from '../../services/creation-service';
import { Collections } from './collections/collections';
import { CreationGrid } from '../../../../shared/components/creation-grid/creation-grid';

@Component({
  selector: 'app-gallery',
  imports: [Collections, CreationGrid],
  templateUrl: './gallery.html',
})
export class Gallery {
  private readonly creationService = inject(CreationService);
  readonly creationList = this.creationService.userCreationList;
}
