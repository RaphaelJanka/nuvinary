import { Injectable, signal } from '@angular/core';
import { User } from '../../interfaces/auth/user';
import { LoginData } from '../../interfaces/auth/loginData';
import { testUser } from '../../test/testdata/user';
import { log } from 'three';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _authUserSignal = signal<User | null>(null);
  authUser = this._authUserSignal.asReadonly();

  // For the time being we until AAWS COGNITO login is implemented,
  private readonly _authErrorSignal = signal<string | null>(null);
  authError = this._authErrorSignal.asReadonly();

  login(credentials: LoginData): boolean {
    this._authErrorSignal.set(null);

    if (credentials.email === testUser.email && credentials.password === testUser.password) {
      this._authUserSignal.set(testUser);
      log('User logged in successfully:', testUser);
      return true;
    }
    console.error('Login failed');
    this._authErrorSignal.set('Invalid email or password');
    return false;
  }

  logOut() {
    this._authUserSignal.set(null);
    log('User logged out successfully');
  }
}
