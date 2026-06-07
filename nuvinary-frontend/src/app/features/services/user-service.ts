import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../shared/services/notification-service';
import { User } from '../../core/auth/auth.interfaces';
import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

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

  async getUserProfile(): Promise<User> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    if (!token) throw new Error('No access token found');
    const restOperation = get({
      apiName: 'NuvinaryApi',
      path: `/me`,
      options: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      },
    });
    const response = await restOperation.response;
    const data = (await response.body.json()) as unknown as User;

    if (!data.uid || !data.email) {
      throw new Error('Invalid user data received');
    }
    return data;
  }

  updateUser(userData: UserCredentialModel) {
    console.log(userData);

    // const user = this.authService.getUserFromLocalStorage();
    // if (user) {
    //   const updatedUser = {
    //     ...user,
    //     firstName: userData.firstName,
    //     lastName: userData.lastName,
    //     displayName: userData.displayName,
    //     avatarColor: userData.color,
    //   };
    //   console.log('Setting new user');
    //   localStorage.setItem(this.authService.STORAGE_KEY, JSON.stringify(updatedUser));
    //   this.authService.setUser(updatedUser);
    this.notificationService.show('Profile updated successfully', 'success');
    // }
  }

  updateEmail(email: string) {
    // const user = this.authService.authUser();
    // if (user) {
    //   const updatedUser = {
    //     ...user,
    //     email,
    //   };
    console.log('Updating user', email);
    // }
  }

  updatePassword(password: string) {
    // const user = this.authService.authUser();
    // if (user) {
    //   const updatedUser = {
    //     ...user,
    //     password,
    //   };
    //   console.log('Updating user', updatedUser);
    // }
    console.log('Updating password', password);
  }

  deleteAccount() {
    // const user = this.authService.authUser();
    // if (user) {
    //   console.log('Deleting account', user);
    // }
    console.log('Deleting account');
  }
}
