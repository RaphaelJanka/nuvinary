import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Check, Folder, ImageOff, LucideAngularModule, Pen, Plus, Trash, X } from 'lucide-angular';
import { CollectionService } from '../../../../services/collection-service';
import { Collection } from '../../models/collection.model';
import { form, maxLength, required } from '@angular/forms/signals';
import { DragAndDropService } from '../../../../services/drag-and-drop-service';
import { DialogService } from '../../../../../shared/services/dialog-service';
import { FormInput } from '../../../../../shared/components/form-input/form-input';
import { Button } from '../../../../../shared/components/button/button';
import { Tooltip } from '../../../../../shared/directives/tooltip';
import { Loader } from '../../../../../shared/components/loader/loader';

@Component({
  selector: 'app-collections',
  imports: [LucideAngularModule, FormInput, Button, Tooltip, Loader],
  templateUrl: './collections.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col flex-1',
  },
})
export class Collections {
  private readonly collectionService = inject(CollectionService);
  private readonly dragService = inject(DragAndDropService);
  private readonly dialogService = inject(DialogService);
  protected readonly collections = this.collectionService.collectionsList;
  protected readonly icons = {
    plusIcon: Plus,
    folderIcon: Folder,
    trashIcon: Trash,
    penIcon: Pen,
    checkIcon: Check,
    cancelIcon: X,
    imageOffIcon: ImageOff,
  };

  /** Ids of collection thumbnails whose image has finished loading, so the loader hides. */
  protected readonly loadedCreationIds = signal<ReadonlySet<string>>(new Set());
  /** Ids of collection thumbnails whose presigned URL failed to load. */
  protected readonly erroredCreationIds = signal<ReadonlySet<string>>(new Set());

  protected readonly expandedCollectionId = signal<string | null>(null);
  protected readonly editingCollectionId = signal<string | null>(null);
  protected readonly isCreating = signal(false);

  private readonly collectionModel = signal<Collection>(
    this.collectionService.getDefaultCollection(),
  );

  protected readonly collectionForm = form(this.collectionModel, (schema) => {
    required(schema.title, { message: 'Title is required' });
    maxLength(schema.title, 20);
  });

  protected readonly dragOverId = this.dragService.dragOverId;
  protected readonly isDragging = this.dragService.isDragging;

  /** Keep in sync with MAX_COLLECTIONS_PER_USER in the backend's create.ts. */
  protected readonly maxCollections = 8;
  protected readonly isCollectionLimitReached = computed(
    () => this.collections().length >= this.maxCollections,
  );

  protected readonly collectionHeaderTooltip = computed(() => {
    if (this.editingCollectionId()) {
      return 'Currently editing...';
    }

    if (this.isCollectionLimitReached() && !this.isCreating()) {
      return `Limit of ${this.maxCollections} collections reached`;
    }

    if (this.isCreating()) {
      return 'Cancel';
    }

    return 'Create Collection';
  });

  // ----------   Actions ------------

  private resetAll() {
    this.isCreating.set(false);
    this.editingCollectionId.set(null);
    this.collectionModel.set(this.collectionService.getDefaultCollection());
    this.collectionForm().reset();
  }

  protected onToggleExpand(id: string) {
    this.resetAll();
    this.expandedCollectionId.update((current) => (current === id ? null : id));
  }

  // Creation of new collection

  protected onCreate() {
    const wasCreating = this.isCreating();
    this.resetAll();
    this.isCreating.set(!wasCreating);
  }

  protected onCancel() {
    this.resetAll();
  }

  protected async onCreateSubmit(event: Event) {
    event.preventDefault();
    const { title } = this.collectionModel();
    try {
      await this.collectionService.addCollection(title);
      this.resetAll();
    } catch {
      // Notification already shown by the service; keep the form open for retry.
    }
  }

  protected async onEditSubmit(event: Event) {
    event.preventDefault();
    const editId = this.editingCollectionId();
    if (!editId) return;
    try {
      const { title } = this.collectionModel();
      await this.collectionService.updateCollectionTitle(editId, title);
      this.resetAll();
    } catch {
      //
    }
  }

  // Edit of collection title

  protected onEdit(collection: Collection) {
    this.resetAll();
    this.collectionModel.set({ ...collection });
    this.editingCollectionId.set(collection.id);
  }

  // Deletion of collection

  protected onDeleteCollection(collection: Collection) {
    this.resetAll();
    this.dialogService
      .openConfirmDialogToDeleteCollection(collection)
      .closed.subscribe((confirmed) => {
        if (confirmed) {
          this.collectionService.deleteCollection(collection.id);
          if (this.expandedCollectionId() === collection.id) {
            this.expandedCollectionId.set(null);
          }
        }
      });
  }

  // Drag & Drop logic

  protected onDragOver(id: string) {
    this.dragService.notifyDragOver(id, (expandedId) => {
      if (this.expandedCollectionId() !== expandedId) {
        this.onToggleExpand(expandedId);
      }
    });
  }

  protected onDragLeave() {
    this.dragService.notifyDragLeave();
  }

  // add new Creation to Collection

  protected onDrop(collectionId: string) {
    const creation = this.dragService.activeCreation();
    if (creation) {
      this.collectionService.addCreationToCollection(collectionId, creation);
    }
    this.dragService.stopDrag();
  }

  // remove creation from collection

  protected onRemoveCreationFromCollection(collectionId: string, creationId: string) {
    this.collectionService.removeCreationFromCollection(collectionId, creationId);
  }

  // Thumbnail load/error state

  protected onImageLoad(creationId: string) {
    this.loadedCreationIds.update((ids) => new Set(ids).add(creationId));
  }

  protected onImageError(creationId: string) {
    this.erroredCreationIds.update((ids) => new Set(ids).add(creationId));
  }
}
