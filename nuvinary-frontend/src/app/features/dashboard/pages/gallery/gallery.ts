import { Component, inject } from '@angular/core';
import { LucideAngularModule, Search } from 'lucide-angular';
import { CreationService } from '../../services/creation-service';
import { Creation } from '../../../../shared/models/creation.model';
import { CreationCard } from '../../../../shared/components/creation-card/creation-card';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CreationDetails } from '../../../../shared/components/creation-details/creation-details';
import { Collections } from './collections/collections';

@Component({
  selector: 'app-gallery',
  imports: [LucideAngularModule, CreationCard, DialogModule, Collections],
  templateUrl: './gallery.html',
})
export class Gallery {
  private readonly creationService = inject(CreationService);
  protected readonly creationList = this.creationService.userCreationList;
  private readonly dialog = inject(Dialog);

  protected readonly icons = {
    searchIcon: Search,
  };

  onOpenDetails(creation: Creation) {
    this.dialog.open(CreationDetails, {
      data: creation,
      maxWidth: '95vw',
    });
  }
}
