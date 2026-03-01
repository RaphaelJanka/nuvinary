import { Component, inject, signal } from '@angular/core';
import { Footer } from '../footer/footer';
import { email, form, FormField, maxLength, minLength, required } from '@angular/forms/signals';
import { LoginData } from '../../interfaces/auth/loginData';
import { AuthService } from '../../services/auth/auth-service';

@Component({
  selector: 'app-login',
  imports: [Footer, FormField],
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);

  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });

  loginForm = form(this.loginModel, (loginSchema) => {
    required(loginSchema.email, { message: 'E-mail is required' });
    required(loginSchema.password, { message: 'Password is required' });
    email(loginSchema.email, { message: 'Please enter a valid e-mail address' });
    minLength(loginSchema.password, 12, {
      message: 'Password must be at least 12 characters long',
    });
    maxLength(loginSchema.password, 128, {
      message: 'Password must be at most 128 characters long',
    });
    maxLength(loginSchema.email, 128, { message: 'E-mail must be at most 128 characters long' });
  });

  onSubmit() {
    if (this.loginForm().valid()) {
      const success = this.authService.login(this.loginModel());
      if (success) {
        console.log('Login successful');
      } else {
        console.error('Login failed');
      }
    }
  }
}
