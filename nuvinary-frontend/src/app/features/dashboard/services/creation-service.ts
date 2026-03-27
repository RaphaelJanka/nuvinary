import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Creation } from '../../../shared/models/creation.model';
import { mockCreationList } from '../../../test/testdata/creations';

@Injectable({
  providedIn: 'root',
})
export class CreationService {
  private readonly authService = inject(AuthService);
  private readonly currentUser = this.authService.authUser;

  // for mock data
  private readonly _creationList = signal<Creation[]>(mockCreationList);

  readonly userCreationList = computed(() =>
    this._creationList().filter((c) => c.createdBy.id === this.currentUser()?.id),
  );

  readonly communityCreationList = computed(() => this._creationList().filter((c) => c.isPublic));

  getCreationSignalById(initialCreation: Creation): Signal<Creation> {
    return computed(
      () => this._creationList().find((c) => c.id === initialCreation.id) ?? initialCreation,
    );
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
  }
}
