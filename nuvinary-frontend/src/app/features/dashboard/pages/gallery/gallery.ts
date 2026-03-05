import { Component } from '@angular/core';
import { Folder, LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-gallery',
  imports: [LucideAngularModule],
  templateUrl: './gallery.html',
})
export class Gallery {
  protected readonly plusIcon = Plus;
  protected readonly folderIcon = Folder;
}
