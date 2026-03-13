import { Component } from '@angular/core';
import { Folder, LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-collections',
  imports: [LucideAngularModule],
  templateUrl: './collections.html',
})
export class Collections {
  protected readonly icons = {
    plusIcon: Plus,
    folderIcon: Folder,
  };
}
