import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { LucideAngularModule, Search, Trash2Icon, X } from 'lucide-angular';
import { Creation } from '../../models/creation.model';
import { CreationCard } from '../creation-card/creation-card';
import { DragService } from '../../../features/dashboard/services/drag-service';
import { DialogService } from '../../services/dialog-service';

@Component({
  selector: 'app-creation-grid',
  imports: [LucideAngularModule, CreationCard],
  templateUrl: './creation-grid.html',
})
export class CreationGrid {
  private readonly dragService = inject(DragService);
  private readonly dialogService = inject(DialogService);
  private readonly dragElements = viewChildren<ElementRef<HTMLElement>>('dragElement');

  readonly creationList = input.required<Creation[]>();
  readonly title = input<string>('Gallery');
  readonly allowDrag = input<boolean>(false);
  readonly allowDelete = input<boolean>(false);
  protected readonly activeCreation = this.dragService.activeCreation;
  protected readonly icons = {
    searchIcon: Search,
    closeIcon: X,
    trashIcon: Trash2Icon,
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

  protected onDragStart(event: DragEvent, creation: Creation, index: number) {
    if (!this.allowDrag()) return;

    this.dragService.startDrag(creation);
    const dragEl = this.dragElements()[index]?.nativeElement;

    if (dragEl && event.dataTransfer) {
      event.dataTransfer.setDragImage(dragEl, 40, 40);
    }
  }

  onDragEnd() {
    this.dragService.stopDrag();
  }

  onDeleteCreation(creation: Creation) {
    this.dialogService.openConfirmDialogToDeleteCreation(creation);
  }
}
