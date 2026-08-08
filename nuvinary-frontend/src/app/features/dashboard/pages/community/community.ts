import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CreationGrid } from '../../creations/creation-grid/creation-grid';
import { CreationService } from '../../creations/creation.service';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { SearchInput } from '../../../../shared/components/page-layout/search-input/search-input';
import { createCreationFilter } from '../../creations/creation-filter';

@Component({
  selector: 'app-community',
  imports: [CreationGrid, PageLayout, SearchInput],
  templateUrl: './community.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Community {
  private readonly creationService = inject(CreationService);
  private readonly filter = createCreationFilter(this.creationService.communityCreationList);
  protected searchQuery = this.filter.searchQuery;
  protected readonly filteredCreations = this.filter.filteredCreations;
  protected readonly isFetching = this.creationService.isLoadingInitialCommunityCreations;
}
