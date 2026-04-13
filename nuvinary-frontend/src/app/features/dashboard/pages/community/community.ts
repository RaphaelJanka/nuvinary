import { Component, inject } from '@angular/core';
import { CreationGrid } from '../../../../shared/components/creation-grid/creation-grid';
import { CreationService } from '../../services/creation-service';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { SearchInput } from '../../../../shared/components/page-layout/search-input/search-input';
import { createCreationFilter } from '../../../../shared/utils/creation-filter';

@Component({
  selector: 'app-community',
  imports: [CreationGrid, PageLayout, SearchInput],
  templateUrl: './community.html',
})
export class Community {
  private readonly creationService = inject(CreationService);
  private readonly filter = createCreationFilter(this.creationService.communityCreationList);
  protected searchQuery = this.filter.searchQuery;
  protected readonly filteredCreations = this.filter.filteredCreations;
}
