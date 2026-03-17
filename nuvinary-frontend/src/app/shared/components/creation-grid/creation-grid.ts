import { Component, computed, inject, input, signal } from '@angular/core';
import { LucideAngularModule, Search, X } from 'lucide-angular';
import { Creation } from '../../models/creation.model';
import { CreationService } from '../../../features/dashboard/services/creation-service';
import { CreationCard } from '../creation-card/creation-card';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CreationDetails } from '../creation-details/creation-details';

@Component({
  selector: 'app-creation-grid',
  imports: [LucideAngularModule, CreationCard, DialogModule],
  templateUrl: './creation-grid.html',
})
export class CreationGrid {
  readonly creationList = input.required<Creation[]>();
  readonly title = input<string>('Gallery');
  private readonly creationService = inject(CreationService);
  private readonly dialog = inject(Dialog);
  protected readonly icons = {
    searchIcon: Search,
    closeIcon: X,
  };

  protected searchQuery = signal('');
  protected readonly filteredCreations = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.creationList();
    if (!query) {
      return list;
    }
    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(query) || c.aiMetadata.prompt.toLowerCase().includes(query),
    );
  });

  onOpenDetails(creation: Creation) {
    const selectedCreation = this.creationService.getCreationForDialog(creation, this.creationList);
    this.dialog.open(CreationDetails, {
      data: selectedCreation,
      maxWidth: '95vw',
    });
  }
}
