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

  login(credentials: LoginData): boolean {
    if (credentials.email === testUser.email && credentials.password === testUser.password) {
      this._authUserSignal.set(testUser);
      log('User logged in successfully:', testUser);
      return true;
    }
    console.error('Login failed');
    return false;
  }

  logOut() {
    this._authUserSignal.set(null);
    log('User logged out successfully');
  }
}
