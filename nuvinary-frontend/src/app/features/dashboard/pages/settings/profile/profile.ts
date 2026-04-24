import { Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Check, Lock, LucideAngularModule } from 'lucide-angular';
import { UserInitialPipe } from '../../../../../shared/pipes/user-initial.pipe';
import { form, required, FormField, minLength } from '@angular/forms/signals';
import { UserCredentialModel, UserService } from '../../../services/user-service';

@Component({
  selector: 'app-profile',
  imports: [PageLayout, LucideAngularModule, UserInitialPipe, FormField],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  protected readonly user = this.authService.authUser;
  protected readonly avatarColors = this.authService.avatarColors;
  protected readonly selectedAvatarColor = signal(this.user()?.avatarColor);
  protected readonly icons = {
    checkIcon: Check,
    lockIcon: Lock,
  };

  private readonly userCredentialModel = signal<UserCredentialModel>({
    firstName: this.user()?.firstName || '',
    lastName: this.user()?.lastName || '',
    displayName: this.user()?.displayName || '',
    color: this.selectedAvatarColor() || '',
  });

  protected readonly userCredentialsForm = form(this.userCredentialModel, (schema) => {
    required(schema.firstName, { message: 'First name is required' });
    required(schema.lastName, { message: 'Last name is required' });
    minLength(schema.firstName, 3, { message: 'First name must be at least 2 characters long' });
    minLength(schema.lastName, 3, { message: 'Last name must be at least 2 characters long' });
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

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (!this.isDisabled()) {
      if (this.userCredentialModel().displayName === '') {
        this.userCredentialModel.update((current) => ({
          ...current,
          displayName: `${current.firstName} ${current.lastName}`,
        }));
      }
      this.userService.updateUser(this.userCredentialsForm().value());
    }
  }
}
