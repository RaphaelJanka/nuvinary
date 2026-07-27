import { effect, inject, Injectable, signal } from '@angular/core';
import { Collection, CollectionCreation } from '../dashboard/pages/models/collection.model';
import { NotificationService } from '../../shared/services/notification-service';
import { ApiBody, ApiService } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly authUser = this.authService.authUser;
  private _collectionList = signal<Collection[]>([]);
  readonly collectionsList = this._collectionList.asReadonly();

  constructor() {
    effect(() => {
      if (this.authUser()) {
        this.loadCollections();
      } else {
        this._collectionList.set([]);
      }
    });
  }

  /** Returns an empty Collection shape for seeding the create/edit form. */
  getDefaultCollection = (): Collection => ({
    id: '',
    createdBy: '',
    title: '',
    createdAt: new Date().toISOString(),
    creations: [],
  });

  /** Fetches the user's collections, with each creation resolved to a fresh presigned URL. */
  private async loadCollections() {
    try {
      const restOperation = await this.apiService.executeGetOperation('/collections');
      const response = await restOperation.response;
      const collections: Collection[] = (await response.body.json()) as unknown as Collection[];
      this._collectionList.set(collections);
    } catch (err) {
      console.error('Error fetching collections', err);
    }
  }

  /** Creates a new collection on the backend and adds it to the local list. */
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
      this._collectionList.update((list) => [...list, collection]);
      this.notificationService.show('Collection created successfully', 'success');
    } catch (err) {
      this.notificationService.show('Error creating collection', 'error');
      throw err;
    }
  }

  async updateCollectionTitle(id: string, title: string) {
    const collectionPayload: ApiBody = {
      title,
    };

    try {
      await this.apiService.executePatchOperation(`/collections/${id}`, collectionPayload);
      this._collectionList.update((collections) =>
        collections.map((c) => (c.id === id ? { ...c, title } : c)),
      );
      this.notificationService.show('Collection title successfully updated', 'success');
    } catch (err) {
      console.error('Error updating collection title', err);
      this.notificationService.show('Error updating collection title', 'error');
      throw err;
    }
  }

  /** Deletes a collection on the backend and removes it from the local list. */
  async deleteCollection(id: string | null) {
    try {
      await this.apiService.executeDeleteOperation(`/collections/${id}`);
      this._collectionList.update((collections) => collections.filter((c) => c.id !== id));
      this.notificationService.show('Collection deleted', 'info');
    } catch (err) {
      console.error('Error deleting collection', err);
      this.notificationService.show('Error deleting collection', 'error');
      throw err;
    }
  }

  /** Adds a creation to a collection on the backend and in the local list, rejecting duplicates. */
  async addCreationToCollection(collectionId: string, newCreation: CollectionCreation) {
    const collection = this._collectionList().find((c) => c.id === collectionId);
    if (collection?.creations.some((c) => c.id === newCreation.id)) {
      this.notificationService.show('Already in this collection', 'error');
      return;
    }

    const payload: ApiBody = { creationId: newCreation.id };
    try {
      await this.apiService.executePostOperation(
        `/collections/${collectionId}/creations`,
        payload,
      );
      this._collectionList.update((collections) =>
        collections.map((coll) =>
          coll.id === collectionId
            ? { ...coll, creations: [...coll.creations, newCreation] }
            : coll,
        ),
      );
      this.notificationService.show('Added to collection', 'success');
    } catch (err) {
      console.error('Error adding creation to collection:', err);
      this.notificationService.show('Error adding creation to collection', 'error');
      throw err;
    }
  }

  /** Removes a creation from a collection on the backend and in the local list. */
  async removeCreationFromCollection(collectionId: string, creationId: string) {
    try {
      await this.apiService.executeDeleteOperation(
        `/collections/${collectionId}/creations/${creationId}`,
      );
      this._collectionList.update((collections) =>
        collections.map((coll) =>
          coll.id === collectionId
            ? { ...coll, creations: coll.creations.filter((c) => c.id !== creationId) }
            : coll,
        ),
      );
      this.notificationService.show('Removed from collection');
    } catch (err) {
      console.error('Error removing creation from collection:', err);
      this.notificationService.show('Error removing creation from collection', 'error');
      throw err;
    }
  }

  removeCreationFromAllCollections(creationId: string) {
    this._collectionList.update((collections) =>
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
