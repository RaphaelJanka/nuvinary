import { Component, inject } from '@angular/core';
import { CreationService } from '../../services/creation-service';
import { Collections } from './collections/collections';
import { CreationGrid } from '../../../../shared/components/creation-grid/creation-grid';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { LucideAngularModule } from 'lucide-angular';
import { SearchInput } from '../../../../shared/components/page-layout/search-input/search-input';
import { createCreationFilter } from '../../../../shared/utils/creation-filter';

@Component({
  selector: 'app-gallery',
  imports: [Collections, CreationGrid, PageLayout, LucideAngularModule, SearchInput],
  templateUrl: './gallery.html',
})
export class Gallery {
  private readonly creationService = inject(CreationService);
  private readonly filter = createCreationFilter(this.creationService.userCreationList);
  protected searchQuery = this.filter.searchQuery;
  protected readonly filteredCreations = this.filter.filteredCreations;
}
