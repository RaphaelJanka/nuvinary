import { Component, signal } from '@angular/core';
import { Folder, LucideAngularModule, Maximize, Plus, Search } from 'lucide-angular';

@Component({
  selector: 'app-gallery',
  imports: [LucideAngularModule],
  templateUrl: './gallery.html',
})
export class Gallery {
  protected readonly plusIcon = Plus;
  protected readonly folderIcon = Folder;
  protected readonly searchIcon = Search;
  protected readonly maximizeIcon = Maximize;
  selectedImageId = signal<number | null>(null);

  protected onOpenDetails(id: number) {
    this.selectedImageId.set(id);
  }

  closeDetails() {
    this.selectedImageId.set(null);
  }
}
