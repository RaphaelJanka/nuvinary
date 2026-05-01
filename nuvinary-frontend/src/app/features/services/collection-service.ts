import { inject, Injectable, signal } from '@angular/core';
import { mockCollections } from '../../../test/testdata/collections';
import { Collection } from '../pages/models/collection.model';
import { Creation } from '../../../shared/models/creation.model';
import { NotificationService } from '../../../shared/services/notification-service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly notificationService = inject(NotificationService);
  private _mockCollections = signal<Collection[]>(mockCollections);
  readonly collections = this._mockCollections.asReadonly();

  getDefaultCollection = (): Collection => ({
    id: '',
    createdBy: '',
    title: '',
    createdAt: new Date(),
    creations: [],
  });

  addCollection(collection: Collection) {
    const newEntry = {
      ...collection,
      id: Math.random().toString(36).substring(2, 9),
    };
    this._mockCollections.update((list) => [...list, newEntry]);
    this.notificationService.show('Collection created successfully', 'success');
  }

  updateCollectionTitle(id: string, newTitle: string) {
    this._mockCollections.update((collections) =>
      collections.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  deleteCollection(id: string | null) {
    this._mockCollections.update((collections) => collections.filter((c) => c.id !== id));
    this.notificationService.show('Collection deleted');
  }

  addCreationToCollection(collectionId: string, newCreation: Creation) {
    this._mockCollections.update((collections) =>
      collections.map((coll) => {
        if (coll.id !== collectionId) return coll;
        const isDuplicate = coll.creations.some((c) => c.id === newCreation.id);

        if (isDuplicate) {
          this.notificationService.show('Already in this collection', 'error');
          return coll;
        }
        return {
          ...coll,
          creations: [...coll.creations, newCreation],
        };
      }),
    );
  }

  removeCreationFromCollection(collectionId: string, creationId: string) {
    this._mockCollections.update((collections) =>
      collections.map((coll) => {
        if (coll.id !== collectionId) return coll;
        return {
          ...coll,
          creations: coll.creations.filter((c) => c.id !== creationId),
        };
      }),
    );
    this.notificationService.show('Removed from collection');
  }

  removeCreationFromAllCollections(creationId: string) {
    this._mockCollections.update((collections) =>
      collections.map((coll) => {
        const hasCreation = coll.creations.some((c) => c.id === creationId);
        if (!hasCreation) return coll;
        return {
          ...coll,
          creations: coll.creations.filter((c) => c.id !== creationId),
        };
      }),
    );
  }
}
