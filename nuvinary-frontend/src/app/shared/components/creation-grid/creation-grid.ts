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
import { CreationService } from '../../../features/dashboard/services/creation-service';
import { CreationCard } from '../creation-card/creation-card';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CreationDetails } from '../creation-details/creation-details';
import { DragService } from '../../../features/dashboard/services/drag-service';
import { DeleteConfirmDialog } from '../confirmation-dialog/delete-confirmation-dialog';
import { CollectionService } from '../../../features/dashboard/services/collection-service';

@Component({
  selector: 'app-creation-grid',
  imports: [LucideAngularModule, CreationCard, DialogModule],
  templateUrl: './creation-grid.html',
})
export class CreationGrid {
  readonly creationList = input.required<Creation[]>();
  readonly title = input<string>('Gallery');
  readonly allowDrag = input<boolean>(false);
  readonly allowDelete = input<boolean>(false);
  private readonly creationService = inject(CreationService);
  private readonly dragService = inject(DragService);
  private readonly collectionService = inject(CollectionService);
  protected readonly activeCreation = this.dragService.activeCreation;
  private readonly dragElements = viewChildren<ElementRef<HTMLElement>>('dragElement');
  private readonly dialog = inject(Dialog);
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

  onOpenDetails(creation: Creation) {
    const selectedCreation = this.creationService.getCreationForDialog(creation, this.creationList);
    this.dialog.open(CreationDetails, {
      data: selectedCreation,
      maxWidth: '95vw',
    });
  }

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
    const dialogRef = this.dialog.open<boolean>(DeleteConfirmDialog, {
      width: '500px',
      disableClose: true,
      height: '350px',
      data: {
        title: `Delete "${creation.title}"?`,
        message: `Are you sure? This action is permanent. Since your account is limited to 10 credits, this credit will be gone forever.`,
      },
    });

    // 2. Auf das Ergebnis warten
    dialogRef.closed.subscribe((result) => {
      if (result === true) {
        this.executeFinalDelete(creation);
      }
    });
  }

  private executeFinalDelete(creation: Creation) {
    this.creationService.deleteCreation(creation);

    this.collectionService.removeCreationFromAllCollections(creation.id);
  }
}
