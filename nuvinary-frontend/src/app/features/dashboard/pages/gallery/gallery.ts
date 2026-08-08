import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CreationService } from '../../creations/creation.service';
import { Collections } from './collections/collections';
import { CreationGrid } from '../../creations/creation-grid/creation-grid';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { LucideAngularModule } from 'lucide-angular';
import { SearchInput } from '../../../../shared/components/page-layout/search-input/search-input';
import { createCreationFilter } from '../../creations/creation-filter';

@Component({
  selector: 'app-gallery',
  imports: [Collections, CreationGrid, PageLayout, LucideAngularModule, SearchInput],
  templateUrl: './gallery.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Gallery {
  private readonly creationService = inject(CreationService);
  private readonly filter = createCreationFilter(this.creationService.userCreationList);
  protected searchQuery = this.filter.searchQuery;
  protected readonly filteredCreations = this.filter.filteredCreations;
  protected readonly isFetching = this.creationService.isLoadingInitialCreations;
}
