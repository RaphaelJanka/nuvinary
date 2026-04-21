import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../shared/services/notification-service';

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
        avatarConfig: {
          ...user.avatarConfig,
          value: userData.color,
        },
      };
      console.log('Setting new user');
      localStorage.setItem(this.authService.STORAGE_KEY, JSON.stringify(updatedUser));
      this.authService.setUser(updatedUser);
      this.notificationService.show('Profile updated successfully', 'success');
    }
  }
}
