import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  WritableSignal,
} from '@angular/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { FormsModule } from '@angular/forms';
import { FieldTree, form, maxLength } from '@angular/forms/signals';
import {
  verifyConfirmPassword,
  verifyPassword,
  verifyEmail,
  verifyAccountDeletion,
  verifyNewPassword,
  verifyCode,
} from '../../../../../shared/utils/validation-functions';
import { UserService } from '../../../../services/user-service';
import { Button } from '../../../../../shared/components/button/button';
import { FormInput } from '../../../../../shared/components/form-input/form-input';
import { DELETE_PHRASE } from '../../../../../shared/utils/validation-functions';
import { Loader } from '../../../../../shared/components/loader/loader';

type CancelActions = 'email' | 'password' | 'account';

@Component({
  selector: 'app-security',
  imports: [PageLayout, FormsModule, Button, FormInput, Loader],
  templateUrl: './security.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Security {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.authUser;
  protected readonly authEmail = this.authService.authEmail;
  private readonly userService = inject(UserService);
  protected readonly isLoading = this.authService.isLoading;

  protected readonly isRequestingEmail = signal(false);
  protected readonly isConfirmingEmail = signal(false);

  private readonly emailModel = signal({
    email: '',
  });

  protected emailUpdateForm = form(this.emailModel, (schema) => {
    verifyEmail(schema.email);
    maxLength(schema.email, 40);
  });

  private readonly emailConfirmationModel = signal({
    code: '',
  });

  private resendTimer = signal(0);

  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Send Code';
  });

  protected readonly canResend = computed(() => this.resendTimer() === 0);

  protected emailConfirmationForm = form(this.emailConfirmationModel, (schema) => {
    verifyCode(schema.code);
  });

  protected readonly isChangingPassword = signal(false);
  private readonly passwordModel = signal({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  protected readonly passwordForm = form(this.passwordModel, (schema) => {
    verifyPassword(schema.oldPassword);
    maxLength(schema.oldPassword, 20);
    verifyNewPassword(schema.newPassword, schema.oldPassword);
    maxLength(schema.newPassword, 20);
    verifyConfirmPassword(schema.confirmPassword, schema.newPassword);
  });

  protected readonly DELETE_PHRASE = DELETE_PHRASE;

  protected readonly isDeleting = signal(false);
  private readonly accountDeletionModel = signal({
    phrase: '',
  });

  protected accountDeletionForm = form(this.accountDeletionModel, (schema) => {
    verifyAccountDeletion(schema.phrase);
    maxLength(schema.phrase, 40);
  });

  protected async onUpdateMail(event: Event) {
    event.preventDefault();
    if (this.emailUpdateForm().valid()) {
      try {
        await this.authService.requestEmailUpdate(this.emailModel().email);

        this.isConfirmingEmail.set(true);
        this.startResendTimer();
      } catch (error) {
        console.error('Error updating email:', error);
      }
    }
  }

  protected async onConfirmEmailUpdate(event: Event) {
    event.preventDefault();
    if (this.emailConfirmationForm().valid()) {
      try {
        await this.authService.confirmEmailUpdate(this.emailConfirmationModel().code);
        this.userService.updateEmail(this.emailModel().email);
        this.onCancel('email');
      } catch (error) {
        console.error('Error confirming email:', error);
      }
    }
  }

  protected async onResendCode() {
    if (this.canResend()) {
      try {
        await this.authService.requestEmailUpdate(this.emailModel().email);
        this.startResendTimer();
      } catch (error) {
        console.error('Error resending code:', error);
      }
    }
  }

  private startResendTimer() {
    this.resendTimer.set(60);

    const tick = () => {
      if (this.resendTimer() <= 0) return;
      this.resendTimer.update((s) => s - 1);
      if (this.resendTimer() > 0) {
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }

  protected async onChangePassword(event: Event) {
    event.preventDefault();
    if (this.passwordForm().valid()) {
      try {
        await this.authService.changePassword(
          this.passwordModel().oldPassword,
          this.passwordModel().newPassword,
        );
        this.onCancel('password');
      } catch (error) {
        console.error('Error changing password:', error);
      }
    }
  }

  protected onDeleteAccount(event: Event) {
    event.preventDefault();
    if (this.accountDeletionForm().valid()) {
      this.userService.deleteAccount();
    }
  }

  private resetForm<T>(
    form: FieldTree<T, string | number>,
    model: WritableSignal<T>,
    initialState: T,
  ) {
    form().reset();
    model.set(initialState);
  }

  protected onCancel(actionType: CancelActions) {
    switch (actionType) {
      case 'email':
        this.isRequestingEmail.set(false);
        this.isConfirmingEmail.set(false);
        this.resetForm(this.emailUpdateForm, this.emailModel, { email: '' });
        this.resetForm(this.emailConfirmationForm, this.emailConfirmationModel, { code: '' });
        this.resendTimer.set(0);
        break;
      case 'password':
        this.isChangingPassword.set(false);
        this.resetForm(this.passwordForm, this.passwordModel, {
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        break;
      case 'account':
        this.isDeleting.set(false);
        this.resetForm(this.accountDeletionForm, this.accountDeletionModel, { phrase: '' });
        break;

      default:
        break;
    }
  }
}
