import { effect, Injectable, signal } from '@angular/core';
import { LoginData, User } from './auth.interfaces';
import { testUser } from '../../test/testdata/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'nuvinary_user';

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

  private getUserFromLocalStorage(): User | null {
    const userJson = localStorage.getItem(this.STORAGE_KEY);
    try {
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }

  login(credentials: LoginData): boolean {
    this._authErrorSignal.set(null);

    if (credentials.email === testUser.email && credentials.password === testUser.password) {
      this._authUserSignal.set(testUser);
      return true;
    }
    console.error('Login failed');
    this._authErrorSignal.set('Invalid email or password');
    return false;
  }

  logOut() {
    this._authUserSignal.set(null);
  }
}
