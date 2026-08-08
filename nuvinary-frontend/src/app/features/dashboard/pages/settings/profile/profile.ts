import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Check, Lock, LucideAngularModule } from 'lucide-angular';
import { UserInitialPipe } from '../../../../../shared/pipes/user-initial.pipe';
import { form, maxLength } from '@angular/forms/signals';
import { UserService } from '../../../../../core/data/user.service';
import { UserUpdateDto } from '../../../../../core/data/user-update.model';
import { Button } from '../../../../../shared/components/button/button';
import { FormInput } from '../../../../../shared/components/form-input/form-input';
import { verifyName } from '../../../../../shared/utils/validation-functions';
import { Tooltip } from '../../../../../shared/directives/tooltip';
import { Loader } from '../../../../../shared/components/loader/loader';

@Component({
  selector: 'app-profile',
  imports: [PageLayout, LucideAngularModule, UserInitialPipe, Button, FormInput, Tooltip, Loader],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  protected readonly user = this.authService.authUser;
  protected readonly authEmail = this.authService.authEmail;
  protected readonly avatarColors = [
    '#D97706',
    '#1D4ED8',
    '#047857',
    '#7C3AED',
    '#BE123C',
    '#334155',
    '#0F766E',
  ];
  protected readonly selectedAvatarColor = signal(this.user()?.avatarColor);
  protected readonly icons = {
    checkIcon: Check,
    lockIcon: Lock,
  };
  protected isLoading = false;

  private readonly userProfileUpdate = signal<UserUpdateDto>({
    firstName: this.user()?.firstName || '',
    lastName: this.user()?.lastName || '',
    displayName: this.user()?.displayName || '',
    avatarColor: this.selectedAvatarColor() || '',
  });

  protected readonly userProfileForm = form(this.userProfileUpdate, (schema) => {
    verifyName(schema.firstName, 'First Name');
    verifyName(schema.lastName, 'Last Name');
    verifyName(schema.displayName, 'Display Name');
    maxLength(schema.firstName, 20);
    maxLength(schema.lastName, 20);
    maxLength(schema.displayName, 20);
  });

  protected isDisabled(): boolean {
    return (
      this.userProfileForm().invalid() ||
      (this.selectedAvatarColor() === this.user()?.avatarColor &&
        this.userProfileUpdate().firstName === this.user()?.firstName &&
        this.userProfileUpdate().lastName === this.user()?.lastName &&
        this.userProfileUpdate().displayName === this.user()?.displayName)
    );
  }

  protected onColorSelect(avatarColor: string) {
    this.selectedAvatarColor.set(avatarColor);
    this.userProfileUpdate.update((current) => ({ ...current, avatarColor }));
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    const uid = this.user()?.uid;
    if (!this.isDisabled() && uid) {
      try {
        this.isLoading = true;
        const updatedUser = await this.userService.updateUser(
          uid,
          this.userProfileForm().value(),
        );
        this.authService.setUser(updatedUser);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
