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
      console.error('Error creating collection:', err);
      this.notificationService.show('Error creating collection', 'error');
      throw err;
    }
  }

  updateCollectionTitle(id: string, newTitle: string) {
    this._collectionList.update((collections) =>
      collections.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  deleteCollection(id: string | null) {
    this._collectionList.update((collections) => collections.filter((c) => c.id !== id));
    this.notificationService.show('Collection deleted');
  }

  addCreationToCollection(collectionId: string, newCreation: CollectionCreation) {
    this._collectionList.update((collections) =>
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
    this._collectionList.update((collections) =>
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
