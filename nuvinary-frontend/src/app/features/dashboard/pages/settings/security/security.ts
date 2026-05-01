import { Component, computed, inject, signal } from '@angular/core';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { FormsModule } from '@angular/forms';
import { form, FormField, maxLength } from '@angular/forms/signals';
import {
  confirmPassword,
  EMAIL_PATTERN,
  password,
  verifyCode,
} from '../../../../../shared/utils/validation-functions';
import { UserService } from '../../../../services/user-service';

type CancelActions = 'email' | 'link' | 'password' | 'account';

@Component({
  selector: 'app-security',
  imports: [PageLayout, FormsModule, FormField],
  templateUrl: './security.html',
})
export class Security {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.authUser;
  private readonly userService = inject(UserService);

  protected readonly isChangingMailAddress = signal(false);
  protected readonly updatedEmail = signal('');
  protected readonly isValidEmail = computed(() => {
    const email = this.updatedEmail().trim();
    const emailRegex = EMAIL_PATTERN;
    return emailRegex.test(email);
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
    password(schema.password);
    maxLength(schema.password, 20);
    confirmPassword(schema.confirmPassword, schema.password);
  });

  protected readonly formFields = [
    {
      id: 'code',
      label: 'Verification Code',
      type: 'text',
      formField: this.passwordForm.code,
      placeholder: 'Enter 6-digit code',
    },
    {
      id: 'password',
      label: 'Password',
      type: 'password',
      formField: this.passwordForm.password,
      placeholder: 'Enter your new password',
    },
    {
      id: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      formField: this.passwordForm.confirmPassword,
      placeholder: 'Confirm your new password',
    },
  ];

  private resendTimer = signal(0);

  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Resend Code';
  });

  protected readonly canResend = computed(() => this.resendTimer() === 0);

  protected readonly isDeleting = signal(false);
  protected readonly confirmText = signal('');
  protected readonly DELETE_PHRASE = 'Delete my account';

  protected canDelete = computed(() => this.confirmText().trim() === this.DELETE_PHRASE);

  protected onUpdateMail() {
    console.log('Update Mail');
    this.userService.updateEmail(this.updatedEmail());
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

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (this.passwordForm().valid()) {
      const updatedPassword = this.passwordModel().password;
      console.log('Updating password', updatedPassword);
      this.userService.updatePassword(updatedPassword);
    }
  }

  protected onDeleteAccount() {
    if (this.canDelete()) {
      console.log('Deleting Account');
      this.userService.deleteAccount();
    }
  }

  private resetForm() {
    this.passwordForm().reset();
    this.passwordModel.set({
      code: '',
      password: '',
      confirmPassword: '',
    });
  }

  protected onCancel(actionType: CancelActions) {
    switch (actionType) {
      case 'email':
        this.isChangingMailAddress.set(false);
        break;
      case 'link':
        this.isSendingLink.set(false);
        if (this.isChangingPassword()) {
          this.isChangingPassword.set(false);
          this.resendTimer.set(0);
          this.resetForm();
        }
        break;
      case 'account':
        this.isDeleting.set(false);
        this.confirmText.set('');
        break;

      default:
        break;
    }
  }
}
