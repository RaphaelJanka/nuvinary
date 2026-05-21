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
  verifyCode,
  verifyPassword,
  verifyEmail,
  verifyAccountDeletion,
} from '../../../../../shared/utils/validation-functions';
import { UserService } from '../../../../services/user-service';
import { Button } from '../../../../../shared/components/button/button';
import { FormInput } from '../../../../../shared/components/form-input/form-input';
import { DELETE_PHRASE } from '../../../../../shared/utils/validation-functions';

type CancelActions = 'email' | 'link' | 'password' | 'account';

@Component({
  selector: 'app-security',
  imports: [PageLayout, FormsModule, Button, FormInput],
  templateUrl: './security.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Security {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.authUser;
  private readonly userService = inject(UserService);

  protected readonly isChangingMailAddress = signal(false);
  private readonly emailModel = signal({
    email: '',
  });
  protected emailUpdateForm = form(this.emailModel, (schema) => {
    verifyEmail(schema.email);
    maxLength(schema.email, 40);
  });

  protected readonly isSendingLink = signal(false);
  protected readonly isChangingPassword = signal(false);
  private readonly passwordModel = signal({
    code: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly passwordForm = form(this.passwordModel, (schema) => {
    verifyCode(schema.code);
    maxLength(schema.code, 6);
    verifyPassword(schema.password);
    maxLength(schema.password, 20);
    verifyConfirmPassword(schema.confirmPassword, schema.password);
  });

  private resendTimer = signal(0);
  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Resend Code';
  });
  protected readonly canResend = computed(() => this.resendTimer() === 0);

  protected readonly DELETE_PHRASE = DELETE_PHRASE;

  protected readonly isDeleting = signal(false);
  private readonly accountDeletionModel = signal({
    phrase: '',
  });

  protected accountDeletionForm = form(this.accountDeletionModel, (schema) => {
    verifyAccountDeletion(schema.phrase);
    maxLength(schema.phrase, 40);
  });

  protected onUpdateMail(event: Event) {
    event.preventDefault();
    if (this.emailUpdateForm().valid()) {
      this.userService.updateEmail(this.emailModel().email);
    }
  }

  protected onResetPassword() {
    this.isChangingPassword.set(true);
    this.onSendCode();
  }

  protected onSendCode() {
    this.resendTimer.set(60);
    const interval = setInterval(() => {
      this.resendTimer.update((s) => s - 1);
      if (this.resendTimer() <= 0) clearInterval(interval);
    }, 1000);
  }

  protected onChangePassword(event: Event) {
    event.preventDefault();
    if (this.passwordForm().valid()) {
      const updatedPassword = this.passwordModel().password;
      console.log('Updating password', updatedPassword);
      this.userService.updatePassword(updatedPassword);
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
        this.isChangingMailAddress.set(false);
        this.resetForm(this.emailUpdateForm, this.emailModel, { email: '' });
        break;
      case 'link':
        this.isSendingLink.set(false);
        if (this.isChangingPassword()) {
          this.isChangingPassword.set(false);
          this.resendTimer.set(0);
          this.resetForm(this.passwordForm, this.passwordModel, {
            code: '',
            password: '',
            confirmPassword: '',
          });
        }
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
