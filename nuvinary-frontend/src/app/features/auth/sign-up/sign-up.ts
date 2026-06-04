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
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-sign-up',
  imports: [FormInput, RouterLink, Button, Loader],
  templateUrl: './sign-up.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignUp {
  private readonly authService = inject(AuthService);
  protected readonly pendingUserEmail = this.authService.pendingUserEmail;
  protected readonly isLoading = this.authService.isLoading;
  private readonly signUpModel = signal<UserRegistrationForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  protected readonly signUpForm = form(this.signUpModel, (schema) => {
    verifyName(schema.firstName, 'First name');
    verifyName(schema.lastName, 'Last name');
    verifyEmail(schema.email);
    verifyPassword(schema.password);
    verifyConfirmPassword(schema.confirmPassword, schema.password);
    maxLength(schema.firstName, 20);
    maxLength(schema.lastName, 20);
    maxLength(schema.email, 40);
    maxLength(schema.password, 20);
  });

  private readonly confirmSignUpModel = signal<{ code: string }>({
    code: '',
  });

  protected readonly confirmForm = form(this.confirmSignUpModel, (schema) => {
    verifyCode(schema.code);
    maxLength(schema.code, 6);
  });

  private resendTimer = signal(0);

  protected readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Send Code';
  });

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

  protected async onResendCode() {
    if (this.canResend()) {
      try {
        await this.authService.resendCode(this.pendingUserEmail()!);
        this.startResendTimer();
      } catch (error) {
        console.error('Error resending code:', error);
      }
    }
  }

  async onSignUp(event: Event) {
    event.preventDefault();
    if (this.signUpForm().valid()) {
      try {
        await this.authService.signUp(this.signUpModel());
        this.startResendTimer();
      } catch (error) {
        console.error('Error signing up:', error);
      }
    }
  }

  onConfirm(event: Event) {
    event.preventDefault();
    if (this.confirmForm().valid()) {
      this.authService.confirmSignUp(this.confirmSignUpModel().code);
    }
  }
}
