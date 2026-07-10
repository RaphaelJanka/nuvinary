import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Check, Lock, LucideAngularModule } from 'lucide-angular';
import { UserInitialPipe } from '../../../../../shared/pipes/user-initial.pipe';
import { form, maxLength } from '@angular/forms/signals';
import { UserCredentialModel, UserService } from '../../../../services/user-service';
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

  private readonly userCredentialModel = signal<UserCredentialModel>({
    firstName: this.user()?.firstName || '',
    lastName: this.user()?.lastName || '',
    displayName: this.user()?.displayName || '',
    color: this.selectedAvatarColor() || '',
  });

  protected readonly userCredentialsForm = form(this.userCredentialModel, (schema) => {
    verifyName(schema.firstName, 'First Name');
    verifyName(schema.lastName, 'Last Name');
    verifyName(schema.displayName, 'Display Name');
    maxLength(schema.firstName, 20);
    maxLength(schema.lastName, 20);
    maxLength(schema.displayName, 20);
  });

  protected isDisabled(): boolean {
    return (
      this.userCredentialsForm().invalid() ||
      (this.selectedAvatarColor() === this.user()?.avatarColor &&
        this.userCredentialModel().firstName === this.user()?.firstName &&
        this.userCredentialModel().lastName === this.user()?.lastName &&
        this.userCredentialModel().displayName === this.user()?.displayName)
    );
  }

  protected onColorSelect(color: string) {
    this.selectedAvatarColor.set(color);
    this.userCredentialModel.update((current) => ({ ...current, color }));
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    const uid = this.user()?.uid;
    if (!this.isDisabled() && uid) {
      try {
        this.isLoading = true;
        const updatedUser = await this.userService.updateUser(
          uid,
          this.userCredentialsForm().value(),
        );
        this.authService.setUser(updatedUser);
      } finally {
        this.isLoading = false;
      }
    }
  }
}
