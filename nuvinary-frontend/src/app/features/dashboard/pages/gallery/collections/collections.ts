import { Component, inject, signal } from '@angular/core';
import { Check, Folder, LucideAngularModule, Pen, Plus, Trash, X } from 'lucide-angular';
import { CollectionService } from '../../../services/collection-service';
import { Collection } from '../../models/collection.model';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';
import { DragService } from '../../../services/drag-service';

@Component({
  selector: 'app-collections',
  imports: [LucideAngularModule, FormField],
  templateUrl: './collections.html',
})
export class Collections {
  private readonly collectionService = inject(CollectionService);
  private readonly dragService = inject(DragService);
  protected readonly collections = this.collectionService.collections;
  protected readonly icons = {
    plusIcon: Plus,
    folderIcon: Folder,
    trashIcon: Trash,
    penIcon: Pen,
    checkIcon: Check,
    cancelIcon: X,
  };

  protected readonly expandedCollectionId = signal<string | null>(null);
  protected readonly deleteCollectionId = signal<string | null>(null);
  protected readonly editingCollectionId = signal<string | null>(null);
  protected readonly isCreating = signal(false);

  private readonly collectionModel = signal<Collection>(
    this.collectionService.getDefaultCollection(),
  );

  protected readonly collectionForm = form(this.collectionModel, (fieldPath) => {
    required(fieldPath.title, { message: 'Title is required' });
    maxLength(fieldPath.title, 20);
  });

  protected readonly dragOverId = signal<string | null>(null);
  protected readonly isDragging = this.dragService.isDragging;
  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  // ----------   Actions ------------

  private resetAll() {
    this.isCreating.set(false);
    this.editingCollectionId.set(null);
    this.deleteCollectionId.set(null);
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

  protected onSubmit(event: Event) {
    event.preventDefault();
    submit(this.collectionForm, async () => {
      const collection = this.collectionModel();
      const editId = this.editingCollectionId();
      if (editId) {
        this.collectionService.updateCollectionTitle(editId, collection.title);
      } else {
        this.collectionService.addCollection(collection);
      }
      this.resetAll();
    });
  }

  // Edit of collection title

  protected onEdit(collection: Collection) {
    this.resetAll();
    this.collectionModel.set({ ...collection });
    this.editingCollectionId.set(collection.id);
  }

  // Deletion of collection

  protected confirmDelete(id: string) {
    this.resetAll();
    this.deleteCollectionId.set(id);
  }

  protected executeDelete(id: string) {
    this.collectionService.deleteCollection(id);
    this.expandedCollectionId.set(null);
    this.resetAll();
  }

  // Drag & Drop logic

  protected onDragOver(id: string) {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    this.dragOverId.set(id);
    if (this.expandedCollectionId() !== id) {
      this.expandedCollectionId.set(id);
    }
  }

  protected onDragLeave() {
    if (this.leaveTimer) clearTimeout(this.leaveTimer);

    this.leaveTimer = setTimeout(() => {
      this.dragOverId.set(null);
      this.leaveTimer = null;
    }, 300);
  }

  protected onDrop(collectionId: string) {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    const creation = this.dragService.activeCreation();
    if (creation) {
      this.collectionService.addCreationToCollection(collectionId, creation);
    }
    this.dragOverId.set(null);
    this.dragService.stopDrag();
  }
}
