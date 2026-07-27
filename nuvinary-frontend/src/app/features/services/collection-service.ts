import { inject, Injectable, signal } from '@angular/core';
import { Collection, CollectionCreation } from '../dashboard/pages/models/collection.model';
import { NotificationService } from '../../shared/services/notification-service';
import { ApiBody, ApiService } from '../../core/api/api.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly notificationService = inject(NotificationService);
  private readonly apiService = inject(ApiService);
  private _collections = signal<Collection[]>([]);
  readonly collections = this._collections.asReadonly();

  getDefaultCollection = (): Collection => ({
    id: '',
    createdBy: '',
    title: '',
    createdAt: new Date().toISOString(),
    creations: [],
  });

  async addCollection(title: string) {
    const collectionPayload: ApiBody = {
      title,
    };
    try {
      const restOperation = await this.apiService.executePostOperation(
        '/collections',
        collectionPayload,
      );
      const response = await restOperation.response;
      const collection = (await response.body.json()) as unknown as Collection;

      this._collections.update((list) => [...list, collection]);
      this.notificationService.show('Collection created successfully', 'success');
    } catch (err) {
      console.error('Error creating collection:', err);
      this.notificationService.show('Error creating collection', 'error');
      throw err;
    }
  }

  updateCollectionTitle(id: string, newTitle: string) {
    this._collections.update((collections) =>
      collections.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  deleteCollection(id: string | null) {
    this._collections.update((collections) => collections.filter((c) => c.id !== id));
    this.notificationService.show('Collection deleted');
  }

  addCreationToCollection(collectionId: string, newCreation: CollectionCreation) {
    this._collections.update((collections) =>
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
    this._collections.update((collections) =>
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
    this._collections.update((collections) =>
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
