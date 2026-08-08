import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, maxLength } from '@angular/forms/signals';
import { UserRegistrationForm } from '../../../core/auth/auth.model';
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
import { ResendHandler } from '../../../shared/utils/resend-handler';

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
  protected readonly resendHandler = new ResendHandler();

  // -------------- sign up ------------------------

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

  // -------------- confirm sign up ------------------------

  private readonly confirmSignUpModel = signal<{ code: string }>({
    code: '',
  });
  protected readonly confirmForm = form(this.confirmSignUpModel, (schema) => {
    verifyCode(schema.code);
    maxLength(schema.code, 6);
  });

  async onSignUp(event: Event) {
    event.preventDefault();
    if (this.signUpForm().valid()) {
      try {
        await this.authService.signUp(this.signUpModel());
        this.resendHandler.startTimer();
      } catch (error) {
        console.error('Error signing up:', error);
      }
    }
  }

  protected async onResendCode() {
    this.resendHandler.execute(async () => {
      await this.authService.resendSignUpCode(this.signUpModel().email);
    });
  }

  protected async onConfirm(event: Event) {
    event.preventDefault();
    if (this.confirmForm().valid()) {
      try {
        await this.authService.confirmSignUp(this.confirmSignUpModel().code);
        this.resendHandler.reset();
      } catch (error) {
        console.error('Error confirming sign up:', error);
      }
    }
  }
}
