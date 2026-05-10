import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { form, maxLength } from '@angular/forms/signals';
import { UserRegistrationForm } from '../../../core/auth/auth.interfaces';
import {
  verifyCode,
  verifyConfirmPassword,
  verifyEmail,
  verifyName,
  verifyPassword,
} from '../../../shared/utils/validation-functions';
import { AuthService } from '../../../core/auth/auth.service';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { RouterLink } from '@angular/router';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-sign-up',
  imports: [FormInput, RouterLink, Button],
  templateUrl: './sign-up.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  private readonly authService = inject(AuthService);
  private readonly signUpModel = signal<UserRegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    code: '',
  });

  protected readonly signUpForm = form(this.signUpModel, (schema) => {
    verifyName(schema.firstName, 'First name');
    verifyName(schema.lastName, 'Last name');
    verifyEmail(schema.email);
    verifyCode(schema.code);
    verifyPassword(schema.password);
    verifyConfirmPassword(schema.confirmPassword, schema.password);
    maxLength(schema.firstName, 20);
    maxLength(schema.lastName, 20);
    maxLength(schema.email, 40);
    maxLength(schema.code, 6);
    maxLength(schema.password, 20);
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

  onSubmit(event: Event) {
    event.preventDefault();
    if (this.signUpForm().valid()) {
      this.authService.signUp(this.signUpModel());
    }
  }
}
