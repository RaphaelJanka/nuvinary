import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../shared/services/notification-service';
import { User } from '../../core/auth/auth.interfaces';
import { get, put } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

export interface UserCredentialModel {
  firstName: string;
  lastName: string;
  displayName: string;
  color: string;
}

type ApiBody = Record<string, string | number | boolean>;

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly notificationService = inject(NotificationService);

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No access token found');
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  async getUserProfile(): Promise<User> {
    const restOperation = get({
      apiName: 'NuvinaryApi',
      path: `/me`,
      options: {
        headers: await this.getAuthHeaders(),
      },
    });
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
      const restOperation = put({
        apiName: 'NuvinaryApi',
        path: `/users/${uid}`,
        options: {
          headers: await this.getAuthHeaders(),
          body: body,
        },
      });

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
