import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { form, maxLength } from '@angular/forms/signals';
import {
  verifyCode,
  verifyConfirmPassword,
  verifyEmail,
  verifyPassword,
} from '../../../shared/utils/validation-functions';
import { Button } from '../../../shared/components/button/button';
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormInput, Button, Loader],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  protected readonly isLoading = this.authService.isLoading;

  private readonly requestResetModel = signal<{ email: string }>({
    email: '',
  });

  private readonly resetPasswordModel = signal<{ code: ''; password: ''; confirmPassword: '' }>({
    code: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly requestResetForm = form(this.requestResetModel, (schema) => {
    verifyEmail(schema.email);
    maxLength(schema.email, 40);
  });

  protected readonly resetPasswordForm = form(this.resetPasswordModel, (schema) => {
    verifyCode(schema.code);
    verifyPassword(schema.password);
    verifyConfirmPassword(schema.confirmPassword, schema.password);
    maxLength(schema.code, 6);
    maxLength(schema.password, 20);
    maxLength(schema.confirmPassword, 20);
  });

  protected readonly isResetting = signal(false);

  private resendTimer = signal(0);

  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Send Code';
  });

  protected async onResendCode() {
    if (this.canResend()) {
      try {
        await this.authService.resendRequestCode();
        this.startResendTimer();
      } catch (error) {
        console.error('Error resending code:', error);
        this.isResetting.set(true);
      }
    }
  }

  protected async onRequest(event: Event) {
    event.preventDefault();
    if (this.requestResetForm().valid()) {
      try {
        await this.authService.requestPasswordReset(this.requestResetModel().email);
        this.isResetting.set(true);
        this.startResendTimer();
        this.requestResetModel.set({ email: '' });
        this.requestResetForm().reset();
      } catch (err) {
        console.error('Error:', err);
      }
    }
  }

  protected readonly canResend = computed(() => this.resendTimer() === 0);

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

  protected async onReset(event: Event) {
    event.preventDefault();
    if (this.resetPasswordForm().valid()) {
      try {
        await this.authService.confirmPasswordReset(
          this.resetPasswordModel().code,
          this.resetPasswordModel().password,
        );
        this.resetPasswordModel.set({ code: '', password: '', confirmPassword: '' });
        this.resetPasswordForm().reset();
      } catch (err) {
        console.error('Error:', err);
      }
    }
  }
}
