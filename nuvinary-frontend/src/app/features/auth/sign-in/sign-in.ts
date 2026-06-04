import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, maxLength } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginData } from '../../../core/auth/auth.interfaces';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { verifyEmail, verifyPassword } from '../../../shared/utils/validation-functions';
import { Button } from '../../../shared/components/button/button';
import { Loader } from '../../../shared/components/loader/loader';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, FormInput, Button, Loader],
  templateUrl: './sign-in.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignIn {
  private readonly authService = inject(AuthService);
  protected readonly isLoading = this.authService.isLoading;
  private readonly loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  protected readonly loginForm = form(this.loginModel, (loginSchema) => {
    verifyEmail(loginSchema.email);
    verifyPassword(loginSchema.password);
    maxLength(loginSchema.password, 20);
    maxLength(loginSchema.email, 40);
  });

  protected async onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      try {
        await this.authService.login(this.loginModel());
      } catch (error) {
        console.error('Error signing up:', error);
      }
    }
  }
}
