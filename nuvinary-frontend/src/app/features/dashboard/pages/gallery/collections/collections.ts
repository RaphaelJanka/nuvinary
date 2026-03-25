import { Component, inject, signal } from '@angular/core';
import { Folder, LucideAngularModule, Plus } from 'lucide-angular';
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
  };
  protected isCreating = false;
  private readonly collectionModel = signal<Collection>(
    this.collectionService.getDefaultCollection(),
  );

  protected readonly collectionForm = form(this.collectionModel, (fieldPath) => {
    required(fieldPath.name, { message: 'Title is required' });
    maxLength(fieldPath.name, 20, { message: 'Title must be at most 20 characters long' });
  });

  protected onCreate() {
    this.isCreating = !this.isCreating;
    if (!this.isCreating) {
      this.resetForm();
    }
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    submit(this.collectionForm, async () => {
      const collection = this.collectionModel();
      this.collectionService.addCollection(collection);
      this.isCreating = false;
      this.resetForm();
    });
  }

  private resetForm() {
    this.collectionModel.set(this.collectionService.getDefaultCollection());
    this.collectionForm().reset();
  }

  protected onCancel() {
    this.isCreating = false;
    this.resetForm();
  }
}
