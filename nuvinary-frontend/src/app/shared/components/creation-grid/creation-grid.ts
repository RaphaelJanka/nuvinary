import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  viewChildren,
} from '@angular/core';
import { LucideAngularModule, Search, Trash2Icon, X } from 'lucide-angular';
import { Creation } from '../../models/creation.model';
import { CreationCard } from '../creation-card/creation-card';
import { DragAndDropService } from '../../services/drag-and-drop.service';
import { DialogService } from '../../../core/ui/dialog.service';

@Component({
  selector: 'app-creation-grid',
  imports: [LucideAngularModule, CreationCard],
  templateUrl: './creation-grid.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationGrid {
  private readonly dragService = inject(DragAndDropService);
  private readonly dialogService = inject(DialogService);
  private readonly dragElements = viewChildren<ElementRef<HTMLElement>>('dragElement');

  readonly creationList = input.required<Creation[]>();
  /** Which backing list this grid renders, so a card knows which list to refresh on image error. */
  readonly source = input.required<'own' | 'community'>();
  readonly allowDrag = input<boolean>(false);
  readonly allowDelete = input<boolean>(false);
  /** Suppresses the "no assets found" empty state while the initial fetch is still in flight. */
  readonly isFetching = input<boolean>(false);
  protected readonly activeCreation = this.dragService.activeCreation;
  protected readonly icons = {
    searchIcon: Search,
    closeIcon: X,
    trashIcon: Trash2Icon,
  };

  protected onDragStart(event: DragEvent, creation: Creation, index: number) {
    if (!this.allowDrag()) return;

    this.dragService.startDrag({ id: creation.id, url: creation.url });
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
