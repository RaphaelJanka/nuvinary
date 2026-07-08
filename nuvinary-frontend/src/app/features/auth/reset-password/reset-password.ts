import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { FieldTree, form, maxLength } from '@angular/forms/signals';
import {
  verifyCode,
  verifyConfirmPassword,
  verifyEmail,
  verifyPassword,
} from '../../../shared/utils/validation-functions';
import { Button } from '../../../shared/components/button/button';
import { Loader } from '../../../shared/components/loader/loader';
import { ResendHandler } from '../../../shared/utils/resend-handler';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormInput, Button, Loader],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  protected readonly isLoading = this.authService.isLoading;
  protected readonly resendHandler = new ResendHandler();

  protected readonly isResetting = signal(false);

  // -------------- request password reset ------------------------

  private readonly requestPasswordResetModel = signal<{ email: string }>({
    email: '',
  });
  protected readonly requestResetForm = form(this.requestPasswordResetModel, (schema) => {
    verifyEmail(schema.email);
    maxLength(schema.email, 40);
  });

  // -------------- reset password ------------------------

  private readonly resetPasswordModel = signal<{ code: ''; password: ''; confirmPassword: '' }>({
    code: '',
    password: '',
    confirmPassword: '',
  });
  protected readonly resetPasswordForm = form(this.resetPasswordModel, (schema) => {
    verifyCode(schema.code);
    verifyPassword(schema.password);
    verifyConfirmPassword(schema.confirmPassword, schema.password);
    maxLength(schema.code, 6);
    maxLength(schema.password, 20);
    maxLength(schema.confirmPassword, 20);
  });

  // -------------- functions ------------------------

  protected async onRequest(event: Event) {
    event.preventDefault();
    if (this.requestResetForm().valid()) {
      try {
        await this.authService.requestPasswordReset(this.requestPasswordResetModel().email);
        this.isResetting.set(true);
        this.resendHandler.startTimer();
        this.resetForm(this.requestResetForm, this.requestPasswordResetModel, { email: '' });
      } catch (err) {
        console.error('Error:', err);
      }
    }
  }

  protected async onResendCode() {
    this.resendHandler.execute(async () => {
      await this.authService.resendPasswordResetCode();
    });
  }

  protected async onReset(event: Event) {
    event.preventDefault();
    if (this.resetPasswordForm().valid()) {
      try {
        await this.authService.confirmPasswordReset(
          this.resetPasswordModel().code,
          this.resetPasswordModel().password,
        );
        this.resetForm(this.resetPasswordForm, this.resetPasswordModel, {
          code: '',
          password: '',
          confirmPassword: '',
        });
        this.resendHandler.reset();
      } catch (err) {
        console.error('Error:', err);
      }
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
}
