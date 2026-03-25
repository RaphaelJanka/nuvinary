import { Injectable, signal } from '@angular/core';
import { mockCollections } from '../../../test/testdata/collections';
import { Collection } from '../pages/models/collection.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
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
}
