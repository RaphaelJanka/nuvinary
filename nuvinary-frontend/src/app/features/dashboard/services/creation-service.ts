import { computed, inject, Injectable, signal } from '@angular/core';
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
  private readonly creationList = signal<Creation[]>(mockCreationList);

  readonly userCreationList = computed(() =>
    this.creationList().filter((c) => c.createdBy.id === this.currentUser()?.id),
  );

  readonly communityCreationList = computed(() => this.creationList().filter((c) => c.isPublic));
}
