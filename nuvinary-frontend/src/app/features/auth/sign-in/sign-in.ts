import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { form, maxLength } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginData } from '../../../core/auth/auth.interfaces';
import { FormInput } from '../../../shared/components/form-input/form-input';
import { verifyEmail, verifyPassword } from '../../../shared/utils/validation-functions';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, FormInput, NgClass],
  templateUrl: './sign-in.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignIn {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
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

  protected onSubmit(event: Event) {
    event.preventDefault();
    if (this.loginForm().valid()) {
      const success = this.authService.login(this.loginModel());
      if (success) {
        this.loginModel.set({ email: '', password: '' });
        this.loginForm().reset();
        this.router.navigate(['/dashboard']);
      }
    }
  }
}
