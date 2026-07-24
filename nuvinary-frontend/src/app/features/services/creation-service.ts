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
  private isRefreshingCreations = false;

  /** The signed-in user's own creations, derived by filtering the shared list on the client. */
  readonly userCreationList = computed(() =>
    this._creationList().filter((c) => c.createdBy.id === this.currentUser()?.uid),
  );

  /**
   * Creations marked public. Currently only ever contains the current user's own public
   * creations, since there is no backend endpoint yet for a cross-user community feed.
   */
  readonly communityCreationList = computed(() => this._creationList().filter((c) => c.isPublic));

  constructor() {
    // Refetch whenever the authenticated user changes (login/app start), and clear
    // the list on logout so the next user never sees a stale/previous user's data.
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

  /**
   * Fetches the current user's creations from the backend and replaces the local list —
   * including fresh presigned image URLs. Called automatically on login, and again
   * whenever a rendered creation image fails to load (its presigned URL likely expired).
   * Guarded against overlapping calls, since several images can fail around the same time.
   */
  async loadUserCreations(): Promise<void> {
    if (this.isRefreshingCreations) return;
    this.isRefreshingCreations = true;
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
    }
  }

  /**
   * Returns a signal that tracks a single creation by id within the shared list, so
   * consumers stay in sync with later local mutations (title, visibility, deletion).
   * Falls back to `initialCreation` if the item isn't (yet) in the list.
   */
  getCreationSignalById(initialCreation: Creation): Signal<Creation> {
    return computed(
      () => this._creationList().find((c) => c.id === initialCreation.id) ?? initialCreation,
    );
  }

  /**
   * Triggers image generation via `POST /creations`, applies the returned remaining
   * credit balance to the current user, and prepends the new creation to the local list.
   */
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
