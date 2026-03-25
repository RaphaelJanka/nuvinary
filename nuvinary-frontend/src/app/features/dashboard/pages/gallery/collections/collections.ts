import { Component, inject, signal } from '@angular/core';
import { Check, Folder, LucideAngularModule, Pen, Plus, Trash, X } from 'lucide-angular';
import { CollectionService } from '../../../services/collection-service';
import { Collection } from '../../models/collection.model';
import { form, FormField, maxLength, required, submit } from '@angular/forms/signals';

@Component({
  selector: 'app-collections',
  imports: [LucideAngularModule, FormField],
  templateUrl: './collections.html',
})
export class Collections {
  private readonly collectionService = inject(CollectionService);
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

  // ----------   Actions ------------

  protected onToggleExpand(id: string) {
    this.expandedCollectionId.update((current) => (current === id ? null : id));
    if (this.deleteCollectionId()) {
      this.resetDeletion();
    }
  }

  // Creation of new collection

  protected onCreate() {
    if (this.editingCollectionId()) return;
    this.isCreating.update((v) => !v);
    this.resetForm();
    if (this.deleteCollectionId()) {
      this.resetDeletion();
    }
  }

  protected onCancel() {
    this.resetForm();
    this.isCreating.set(false);
  }

  private resetForm() {
    this.collectionModel.set(this.collectionService.getDefaultCollection());
    this.collectionForm().reset();
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
      this.isCreating.set(false);
      this.editingCollectionId.set(null);
      this.resetForm();
    });
  }

  // Edit of collection title

  protected onEdit(collection: Collection) {
    this.collectionModel.set({ ...collection });
    this.editingCollectionId.set(collection.id);
  }

  // Deletion of collection

  protected confirmDelete(id: string) {
    this.deleteCollectionId.set(id);
  }

  protected cancelDelete() {
    this.resetDeletion();
  }

  protected executeDelete(id: string) {
    this.collectionService.deleteCollection(id);
    this.expandedCollectionId.set(null);
    this.resetDeletion();
  }

  private resetDeletion() {
    this.deleteCollectionId.set(null);
  }
}
