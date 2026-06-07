import { effect, inject, Injectable, signal } from '@angular/core';
import { LoginData, User, UserRegistrationForm } from './auth.interfaces';
import { NotificationService } from '../../shared/services/notification-service';
import {
  signUp,
  signOut,
  AuthError,
  confirmSignUp,
  resendSignUpCode,
  getCurrentUser,
  signIn,
  updatePassword,
  resetPassword,
  confirmResetPassword,
} from 'aws-amplify/auth';
import { Router } from '@angular/router';
import { UserService } from '../../features/services/user-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  readonly STORAGE_KEY = 'nuvinary_user';
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  private readonly _pendingUserEmailSignal = signal<string | null>(null);
  pendingUserEmail = this._pendingUserEmailSignal.asReadonly();

  private readonly _authUserSignal = signal<User | null>(null);
  authUser = this._authUserSignal.asReadonly();

  private readonly _authErrorSignal = signal<string | null>(null);
  authError = this._authErrorSignal.asReadonly();

  readonly isLoading = signal(false);

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
      console.error('AuthService: Error parsing user from localStorage:', error);
      return null;
    }
  }

  async initSession() {
    try {
      await getCurrentUser();
      const cachedUser = this.getUserFromLocalStorage();
      if (cachedUser) {
        this.setUser(cachedUser);
      } else {
        const fullProfile = await this.userService.getUserProfile();
        this.setUser(fullProfile);
      }
    } catch {
      this.setUser(null);
    }
  }

  setUser(user: User | null) {
    this._authUserSignal.set(user);
  }

  async login(credentials: LoginData) {
    this.isLoading.set(true);
    try {
      await signIn({
        username: credentials.email,
        password: credentials.password,
      });
      const fullProfile = await this.userService.getUserProfile();
      this.setUser(fullProfile);
      this.router.navigate(['/dashboard']);

      this.notificationService.show('Login successful!', 'success');
    } catch (err: unknown) {
      let message = 'An unknown error has occurred';

      if (err instanceof AuthError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      this.notificationService.show(message, 'error');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logOut() {
    this.setUser(null);
    try {
      await signOut();
      this.notificationService.show('Logged out successfully', 'info');
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    }
  }

  async signUp(userData: UserRegistrationForm): Promise<void> {
    this.isLoading.set(true);
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
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendCode(email: string): Promise<void> {
    this.isLoading.set(true);
    try {
      await resendSignUpCode({ username: email });
      this.notificationService.show(
        'Confirmation code resent. Please check your emails.',
        'success',
      );
      this.isLoading.set(false);
    } catch (err: unknown) {
      this.isLoading.set(false);
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    }
  }

  async confirmSignUp(code: string) {
    this.isLoading.set(true);
    try {
      await confirmSignUp({
        username: this._pendingUserEmailSignal()!,
        confirmationCode: code,
      });
      this._pendingUserEmailSignal.set(null);
      this.router.navigate(['/auth/signin']);
      this.notificationService.show('Registration confirmed. You can now sign in.', 'success');
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  // requesting passowrd reset

  async requestPasswordReset(email: string) {
    this.isLoading.set(true);
    try {
      await resetPassword({ username: email });
      this.notificationService.show(
        'Please check your emails for the confirmation code.',
        'success',
      );
      this._pendingUserEmailSignal.set(email);
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async resendRequestCode() {
    const email = this.pendingUserEmail();
    if (!email) {
      this.notificationService.show('No email found. Please restart the process.', 'error');
      throw new Error();
    }

    await this.requestPasswordReset(email);
  }

  // confirm password reset

  async confirmPasswordReset(code: string, newPassword: string) {
    this.isLoading.set(true);
    try {
      await confirmResetPassword({
        username: this.pendingUserEmail()!,
        confirmationCode: code,
        newPassword,
      });
      this.notificationService.show('Passwort erfolgreich zurückgesetzt.', 'success');
      this.router.navigate(['/auth/signin']);
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  // Update current password

  async changePassword(oldPassword: string, newPassword: string) {
    this.isLoading.set(true);
    try {
      await updatePassword({
        oldPassword,
        newPassword,
      });
      this.notificationService.show('Password successfully changed.', 'success');
      this._pendingUserEmailSignal.set(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unknown error has occurred';
      this.notificationService.show(message, 'error');
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }
}
