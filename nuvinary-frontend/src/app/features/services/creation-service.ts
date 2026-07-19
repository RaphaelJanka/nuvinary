import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { ApiError } from 'aws-amplify/api';
import { AuthService } from '../../core/auth/auth.service';
import { Creation } from '../../shared/models/creation.model';
import { mockCreationList } from '../../test/testdata/creations';
import { NotificationService } from '../../shared/services/notification-service';
import { ApiBody, ApiService } from '../../core/api/api.service';

const DEFAULT_GENERATE_ERROR_MESSAGE = 'Failed to generate your creation';

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

  // for mock data
  private readonly _creationList = signal<Creation[]>(mockCreationList);

  readonly userCreationList = computed(() =>
    this._creationList().filter((c) => c.createdBy.id === this.currentUser()?.uid),
  );

  readonly communityCreationList = computed(() => this._creationList().filter((c) => c.isPublic));

  getDefaultCreationModel = (): CreationModel => ({
    prompt: '',
    title: '',
  });

  getCreationSignalById(initialCreation: Creation): Signal<Creation> {
    return computed(
      () => this._creationList().find((c) => c.id === initialCreation.id) ?? initialCreation,
    );
  }

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
      const { remainingCredits, ...creation } = (await response.body.json()) as unknown as Creation & {
        remainingCredits: number;
      };

      const user = this.currentUser();
      if (user) {
        this.authService.setUser({ ...user, credits: remainingCredits });
      }

      this.notificationService.show('Creation generated', 'success');
      return creation;
    } catch (err) {
      const message = this.extractGenerateErrorMessage(err);
      this.notificationService.show(message, 'error');
      throw new Error(message);
    }
  }

  private extractGenerateErrorMessage(err: unknown): string {
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
    return DEFAULT_GENERATE_ERROR_MESSAGE;
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
