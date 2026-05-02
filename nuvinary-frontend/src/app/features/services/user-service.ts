import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../shared/services/notification-service';

export interface UserCredentialModel {
  firstName: string;
  lastName: string;
  displayName: string;
  color: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  updateUser(userData: UserCredentialModel) {
    console.log(userData);

    const user = this.authService.getUserFromLocalStorage();
    if (user) {
      const updatedUser = {
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        displayName: userData.displayName,
        avatarColor: userData.color,
      };
      console.log('Setting new user');
      localStorage.setItem(this.authService.STORAGE_KEY, JSON.stringify(updatedUser));
      this.authService.setUser(updatedUser);
      this.notificationService.show('Profile updated successfully', 'success');
    }
  }

  updateEmail(email: string) {
    const user = this.authService.authUser();
    if (user) {
      const updatedUser = {
        ...user,
        email,
      };
      console.log('Updating user', updatedUser);
    }
  }

  updatePassword(password: string) {
    const user = this.authService.authUser();
    if (user) {
      const updatedUser = {
        ...user,
        password,
      };
      console.log('Updating user', updatedUser);
    }
  }

  deleteAccount() {
    const user = this.authService.authUser();
    if (user) {
      console.log('Deleting account', user);
    }
  }
}
