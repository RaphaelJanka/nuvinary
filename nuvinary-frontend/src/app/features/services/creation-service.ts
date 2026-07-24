import { computed, effect, inject, Injectable, Signal, signal } from '@angular/core';
import { ApiError } from 'aws-amplify/api';
import { AuthService } from '../../core/auth/auth.service';
import { Creation } from '../../shared/models/creation.model';
import { NotificationService } from '../../shared/services/notification-service';
import { ApiBody, ApiService } from '../../core/api/api.service';

const DEFAULT_GENERATE_ERROR_MESSAGE = 'Failed to generate your creation';
const DEFAULT_LOAD_ERROR_MESSAGE = 'Failed to load your creations';

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

  private readonly _creationList = signal<Creation[]>([]);
  /** Prevents overlapping `loadUserCreations()` calls (e.g. multiple images erroring at once). */
  private isRefreshingCreations = false;
  /** Distinguishes the initial load from later silent refreshes. */
  private hasLoadedOnce = false;

  private readonly _isLoadingInitialCreations = signal(false);
  /** True only while the very first `loadUserCreations()` call is in flight. */
  readonly isLoadingInitialCreations = this._isLoadingInitialCreations.asReadonly();

  /** The signed-in user's own creations. */
  readonly userCreationList = computed(() =>
    this._creationList().filter((c) => c.createdBy.id === this.currentUser()?.uid),
  );

  /** Public creations — only the current user's own for now, no community backend yet. */
  readonly communityCreationList = computed(() => this._creationList().filter((c) => c.isPublic));

  constructor() {
    // Load on login, clear on logout.
    effect(() => {
      if (this.currentUser()) {
        this.loadUserCreations();
      } else {
        this._creationList.set([]);
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
      this._creationList.set(creations);
    } catch (err) {
      const message = this.extractErrorMessage(err, DEFAULT_LOAD_ERROR_MESSAGE);
      this.notificationService.show(message, 'error');
    } finally {
      this.isRefreshingCreations = false;
      this.hasLoadedOnce = true;
      this._isLoadingInitialCreations.set(false);
    }
  }

  /** Tracks a single creation by id within the shared list, falling back to `initialCreation`. */
  getCreationSignalById(initialCreation: Creation): Signal<Creation> {
    return computed(
      () => this._creationList().find((c) => c.id === initialCreation.id) ?? initialCreation,
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

      this._creationList.update((list) => [creation, ...list]);
      this.notificationService.show('Creation generated', 'success');
      return creation;
    } catch (err) {
      const message = this.extractErrorMessage(err, DEFAULT_GENERATE_ERROR_MESSAGE);
      this.notificationService.show(message, 'error');
      throw new Error(message);
    }
  }

  /** Unwraps a backend-supplied error message from an ApiError, or falls back to `defaultMessage`. */
  private extractErrorMessage(err: unknown, defaultMessage: string): string {
    if (err instanceof ApiError && err.response?.body) {
      try {
        const body = JSON.parse(err.response.body) as { message?: string };
        if (body.message) {
          return body.message;
        }
      } catch {
        // response body wasn't JSON, fall through to the default message
      }
    }
    return defaultMessage;
  }

  updateTitle(id: string, newTitle: string) {
    this._creationList.update((list) =>
      list.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  }

  togglePublicStatus(id: string) {
    this._creationList.update((list) =>
      list.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)),
    );
  }

  deleteCreation(creation: Creation) {
    this._creationList.update((list) => list.filter((c) => c.id !== creation.id));
    this.notificationService.show('Creation permanently deleted', 'success');
  }
}
