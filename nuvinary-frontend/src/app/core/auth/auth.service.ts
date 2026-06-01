import { effect, inject, Injectable, signal } from '@angular/core';
import { User, UserRegistrationForm } from './auth.interfaces';
import { NotificationService } from '../../shared/services/notification-service';
import { signUp, signOut, AuthError, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly STORAGE_KEY = 'nuvinary_user';
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  private readonly _pendingUserEmailSignal = signal<string | null>(null);
  pendingUserEmail = this._pendingUserEmailSignal.asReadonly();

  private readonly _authUserSignal = signal<User | null>(this.getUserFromLocalStorage());
  authUser = this._authUserSignal.asReadonly();

  private readonly _authErrorSignal = signal<string | null>(null);
  authError = this._authErrorSignal.asReadonly();

  readonly avatarColors = [
    '#D97706',
    '#1D4ED8',
    '#047857',
    '#7C3AED',
    '#BE123C',
    '#334155',
    '#0F766E',
  ];

  constructor() {
    effect(() => {
      const user = this.authUser();
      if (user) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    });
  }

  getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  setUser(user: User | null) {
    this._authUserSignal.set(user);
  }

  // async login(credentials: LoginData): Promise<boolean> {
  //   try {
  //     const { isSignedIn } = await signIn({
  //       username: credentials.email,
  //       password: credentials.password
  //     });

  //     if (isSignedIn) {
  //       const user = await getCurrentUser();
  //       this.setUser(user);
  //       return true;
  //     }
  //     return false;
  //   } catch (err: any) {
  //     this.notificationService.show(err.message, 'error');
  //     return false;
  //   }
  // }

  // login(credentials: LoginData): boolean {
  //   this._authErrorSignal.set(null);
  //   console.log('credentials', credentials);
  //   this.setUser(testUser);
  //   return true;

  //   console.error('Login failed');
  //   // this._authErrorSignal.set('Invalid email or password');
  //   // return false;
  // }

  async logOut() {
    await signOut();
    this._authUserSignal.set(null);
  }

  // logOut() {
  //   this._authUserSignal.set(null);
  // }

  async signUp(userData: UserRegistrationForm): Promise<void> {
    try {
      await signUp({
        username: userData.email,
        password: userData.password,
        options: {
          userAttributes: {
            email: userData.email,
            given_name: userData.firstName,
            family_name: userData.lastName,
          },
        },
      });

      this._pendingUserEmailSignal.set(userData.email);
      this.notificationService.show(
        'Registration started. Please check your emails for the confirmation code.',
        'success',
      );
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    }
  }

  async resendCode(email: string): Promise<void> {
    try {
      await resendSignUpCode({ username: email });
      this.notificationService.show('Code erneut gesendet!', 'success');
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    }
  }

  async confirmSignUp(code: string) {
    try {
      await confirmSignUp({
        username: this._pendingUserEmailSignal()!,
        confirmationCode: code,
      });
      this._pendingUserEmailSignal.set(null);
      this.router.navigate(['/auth/signin']);
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
    }
  }

  resetPassword(email: string) {
    console.log('Password reset requested for email:', email);
    this.notificationService.show('Password reset link sent to your email!', 'success');
  }
}
