import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Creation } from '../../shared/models/creation.model';
import { NotificationService } from '../../shared/services/notification-service';
import { ErrorHandlingService } from '../../shared/services/error-handling-service';
import { ApiBody, ApiService } from '../../core/api/api.service';

export interface CreationModel {
  prompt: string;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreationService {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly currentUser = this.authService.authUser;
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlingService = inject(ErrorHandlingService);

  private readonly _userCreationList = signal<Creation[]>([]);
  /** The signed-in user's own creations. */
  readonly userCreationList = this._userCreationList.asReadonly();
  /** Prevents overlapping `loadUserCreations()` calls (e.g. multiple images erroring at once). */
  private isRefreshingCreations = false;
  /** Distinguishes the initial load from later silent refreshes. */
  private hasLoadedOnce = false;

  private readonly _isLoadingInitialCreations = signal(false);
  /** True only while the very first `loadUserCreations()` call is in flight. */
  readonly isLoadingInitialCreations = this._isLoadingInitialCreations.asReadonly();

  private readonly _communityCreationList = signal<Creation[]>([]);
  /** All public creations across all users. */
  readonly communityCreationList = this._communityCreationList.asReadonly();
  /** Prevents overlapping `loadCommunityCreations()` calls. */
  private isRefreshingCommunityCreations = false;
  /** Distinguishes the initial load from later silent refreshes. */
  private hasLoadedCommunityOnce = false;

  private readonly _isLoadingInitialCommunityCreations = signal(false);
  /** True only while the very first `loadCommunityCreations()` call is in flight. */
  readonly isLoadingInitialCommunityCreations =
    this._isLoadingInitialCommunityCreations.asReadonly();

  constructor() {
    // Load on login, clear on logout.
    effect(() => {
      if (this.currentUser()) {
        this.loadUserCreations();
        this.loadCommunityCreations();
      } else {
        this._userCreationList.set([]);
        this._communityCreationList.set([]);
      }
    });
  }

  getDefaultCreationModel = (): CreationModel => ({
    prompt: '',
    title: '',
  });

  /** Fetches the user's creations with fresh presigned URLs. Guarded against overlapping calls. */
  async loadUserCreations(): Promise<void> {
    if (this.isRefreshingCreations) return;
    this.isRefreshingCreations = true;
    const isFirstLoad = !this.hasLoadedOnce;
    if (isFirstLoad) this._isLoadingInitialCreations.set(true);

    try {
      const restOperation = await this.apiService.executeGetOperation('/creations');
      const response = await restOperation.response;
      const creations = (await response.body.json()) as unknown as Creation[];
      this._userCreationList.set(creations);
    } catch (err) {
      this.errorHandlingService.handle(err);
    } finally {
      this.isRefreshingCreations = false;
      this.hasLoadedOnce = true;
      this._isLoadingInitialCreations.set(false);
    }
  }

  /** Fetches all public creations with fresh presigned URLs. Guarded against overlapping calls. */
  async loadCommunityCreations(): Promise<void> {
    if (this.isRefreshingCommunityCreations) return;
    this.isRefreshingCommunityCreations = true;
    const isFirstLoad = !this.hasLoadedCommunityOnce;
    if (isFirstLoad) this._isLoadingInitialCommunityCreations.set(true);

    try {
      const restOperation = await this.apiService.executeGetOperation('/community');
      const response = await restOperation.response;
      const creations = (await response.body.json()) as unknown as Creation[];
      this._communityCreationList.set(creations);
    } catch (err) {
      this.errorHandlingService.handle(err);
    } finally {
      this.isRefreshingCommunityCreations = false;
      this.hasLoadedCommunityOnce = true;
      this._isLoadingInitialCommunityCreations.set(false);
    }
  }

  /** Tracks a single creation by id across both lists, falling back to `initialCreation`. */
  getCreationSignalById(initialCreation: Creation): Signal<Creation> {
    return computed(
      () =>
        this._userCreationList().find((c) => c.id === initialCreation.id) ??
        this._communityCreationList().find((c) => c.id === initialCreation.id) ??
        initialCreation,
    );
  }

  /** Generates a new image and prepends it to the local list. */
  async generateCreation(creationModel: CreationModel): Promise<Creation> {
    const creationPayload: ApiBody = {
      prompt: creationModel.prompt,
      title: creationModel.title,
    };

    try {
      const restOperation = await this.apiService.executePostOperation(
        '/creations',
        creationPayload,
      );
      const response = await restOperation.response;
      const { remainingCredits, ...creation } =
        (await response.body.json()) as unknown as Creation & {
          remainingCredits: number;
        };

      const user = this.currentUser();
      if (user) {
        this.authService.setUser({ ...user, credits: remainingCredits });
      }

      this._userCreationList.update((list) => [creation, ...list]);
      this.notificationService.show('Creation generated', 'success');
      return creation;
    } catch (err) {
      const message = this.errorHandlingService.handle(err);
      throw new Error(message);
    }
  }

  /** Updates a creation's title on the backend and in both local lists. */
  async updateTitle(id: string, title: string) {
    const creationPayload: ApiBody = {
      title,
    };

    try {
      await this.apiService.executePatchOperation(`/creations/${id}`, creationPayload);
      this._userCreationList.update((list) =>
        list.map((c) => (c.id === id ? { ...c, title } : c)),
      );
      this._communityCreationList.update((list) =>
        list.map((c) => (c.id === id ? { ...c, title } : c)),
      );
      this.notificationService.show('Title successfully changed', 'success');
    } catch (err) {
      const message = this.errorHandlingService.handle(err);
      throw new Error(message);
    }
  }

  /** Sets a creation's visibility on the backend, and adds/removes it from the community list. */
  async togglePublicStatus(id: string, isPublic: boolean) {
    const creationPayload: ApiBody = {
      isPublic,
    };
    try {
      await this.apiService.executePatchOperation(`/creations/${id}`, creationPayload);
      this._userCreationList.update((list) =>
        list.map((c) => (c.id === id ? { ...c, isPublic } : c)),
      );

      if (isPublic) {
        const creation = this._userCreationList().find((c) => c.id === id);
        if (creation) {
          this._communityCreationList.update((list) =>
            list.some((c) => c.id === id) ? list : [creation, ...list],
          );
        }
      } else {
        this._communityCreationList.update((list) => list.filter((c) => c.id !== id));
      }
    } catch (err) {
      this.errorHandlingService.handle(err);
    }
  }

  /** Deletes a creation on the backend and removes it from both local lists. */
  async deleteCreation(id: string) {
    try {
      await this.apiService.executeDeleteOperation(`/creations/${id}`);
      this._userCreationList.update((list) => list.filter((c) => c.id !== id));
      this._communityCreationList.update((list) => list.filter((c) => c.id !== id));
      this.notificationService.show('Creation permanently deleted', 'success');
    } catch (err) {
      const message = this.errorHandlingService.handle(err);
      throw new Error(message);
    }
  }
}
