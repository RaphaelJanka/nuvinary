import { inject, Injectable, signal } from '@angular/core';
import { mockCollections } from '../../../test/testdata/collections';
import { Collection } from '../pages/models/collection.model';
import { CreationService } from './creation-service';
import { Creation } from '../../../shared/models/creation.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly creationService = inject(CreationService);
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
  }

  updateCollectionTitle(id: string, newTitle: string) {
    this._mockCollections.update((collections) =>
      collections.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  deleteCollection(id: string | null) {
    this._mockCollections.update((collections) => collections.filter((c) => c.id !== id));
  }

  addCreationToCollection(collectionId: string, newCreation: Creation) {
    this._mockCollections.update((collections) =>
      collections.map((coll) => {
        if (coll.id !== collectionId) return coll;
        const isDuplicate = coll.creations.some((c) => c.id === newCreation.id);

        if (isDuplicate) {
          return coll;
        }
        return {
          ...coll,
          creations: [...coll.creations, newCreation],
        };
      }),
    );
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
