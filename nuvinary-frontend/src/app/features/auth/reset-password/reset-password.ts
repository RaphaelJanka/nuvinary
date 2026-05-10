import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { form, maxLength } from '@angular/forms/signals';
import { verifyCode, verifyPassword } from '../../../shared/utils/validation-functions';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink, FormInput, Button],
  templateUrl: './reset-password.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPassword {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly resetPasswordModel = signal({
    code: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly resetPasswordForm = form(this.resetPasswordModel, (schema) => {
    verifyCode(schema.code);
    verifyPassword(schema.password);
    verifyPassword(schema.confirmPassword);
    maxLength(schema.code, 6);
    maxLength(schema.password, 20);
    maxLength(schema.confirmPassword, 20);
  });

  private resendTimer = signal(0);

  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Send Code';
  });

  protected readonly canResend = computed(() => this.resendTimer() === 0);

  protected onSendCode() {
    this.resendTimer.set(60);
    const interval = setInterval(() => {
      this.resendTimer.update((s) => s - 1);
      if (this.resendTimer() <= 0) clearInterval(interval);
    }, 1000);
  }

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (this.resetPasswordForm().valid()) {
      this.authService.resetPassword(this.resetPasswordModel().password);
      this.resetPasswordModel.set({ code: '', password: '', confirmPassword: '' });
      this.resetPasswordForm().reset();
      this.router.navigate(['/dashboard']);
    }
  }
}
