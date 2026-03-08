import { Component, inject, signal } from '@angular/core';
import { Folder, LucideAngularModule, Plus, Search } from 'lucide-angular';
import { CreationService } from '../../services/creation-service';
import { Creation } from '../../../../shared/models/creation.model';
import { CreationCard } from '../../../../shared/components/creation-card/creation-card';

@Component({
  selector: 'app-gallery',
  imports: [LucideAngularModule, CreationCard],
  templateUrl: './gallery.html',
})
export class Gallery {
  private readonly creationService = inject(CreationService);
  protected readonly creationList = this.creationService.userCreationList;
  protected readonly plusIcon = Plus;
  protected readonly folderIcon = Folder;
  protected readonly searchIcon = Search;

  selectedImageId = signal<Creation | null>(null);

  protected onOpenDetails(creation: Creation) {
    this.selectedImageId.set(creation);
  }

  closeDetails() {
    this.selectedImageId.set(null);
  }
}
