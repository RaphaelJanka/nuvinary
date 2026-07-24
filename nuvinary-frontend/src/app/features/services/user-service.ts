import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../shared/services/notification-service';
import { User } from '../../core/auth/auth.interfaces';
import { ApiBody, ApiService } from '../../core/api/api.service';

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
  private readonly notificationService = inject(NotificationService);
  private readonly apiService = inject(ApiService);

  async getUserProfile(): Promise<User> {
    const restOperation = await this.apiService.executeGetOperation('/me');
    const response = await restOperation.response;
    const data = (await response.body.json()) as unknown as User;

    if (!data.uid) {
      throw new Error('Invalid user data received');
    }
    return data;
  }

  async updateUser(uid: string, userData: UserCredentialModel): Promise<User> {
    const body: ApiBody = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      avatarColor: userData.color,
    };

    try {
      const restOperation = await this.apiService.executePutOperation(`/users/${uid}`, body);
      const response = await restOperation.response;
      const updatedUser = (await response.body.json()) as unknown as User;
      this.notificationService.show('Profile updated successfully', 'success');
      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile:', error);
      this.notificationService.show('Failed to update profile', 'error');
      throw error;
    }
  }

  deleteAccount() {
    // const user = this.authService.authUser();
    // if (user) {
    //   console.log('Deleting account', user);
    // }
    console.log('Deleting account');
  }
}
