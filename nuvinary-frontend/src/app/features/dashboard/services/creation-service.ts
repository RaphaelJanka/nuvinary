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

  /**
   * Creates a computed signal for a single asset from a list.
   *
   * @param creation The creation object used for ID lookup and as a stable fallback.
   * @param listSignal The source list signal to monitor for reactive changes.
   * @returns A readonly signal that always emits the most recent creation.
   */
  getCreationForDialog(creation: Creation, listSignal: Signal<Creation[]>): Signal<Creation> {
    return computed(() => listSignal().find((c) => c.id === creation.id) ?? creation);
  }

  togglePublicStatus(id: string) {
    this._creationList.update((list) =>
      list.map((c) => (c.id === id ? { ...c, isPublic: !c.isPublic } : c)),
    );
  }
}
