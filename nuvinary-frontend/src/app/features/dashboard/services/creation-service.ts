import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { Creation } from '../../../shared/models/creation.model';
import { mockCreationList } from '../../../test/testdata/creations';
import { NotificationService } from '../../../shared/services/notification-service';

export interface CreationModel {
  prompt: string;
  title: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreationService {
  private readonly authService = inject(AuthService);
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

  addCreation(creationModel: CreationModel) {
    console.log(creationModel);

    // for later:

    // Bevor wir das teure Bildmodell anfragen, schicken wir den Prompt an ein günstiges Text-Modell.

    // Die Logik dahinter:

    // Check: "Ist dieser Text ein beschreibender Bild-Prompt?"

    // Reaktion: Wenn ja -> Weiter zur Bildgenerierung.

    // Reaktion: Wenn nein -> Die KI antwortet im Dialog: "Hmm, that sounds a bit cryptic. Could you describe your vision with a few more details so I can create something amazing?"
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
