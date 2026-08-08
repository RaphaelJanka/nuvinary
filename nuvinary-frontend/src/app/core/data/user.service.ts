import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../feedback/notification.service';
import { ErrorHandlingService } from '../feedback/error-handling.service';
import { User } from '../../shared/models/user.model';
import { ApiService } from '../api/api.service';
import { ApiBody } from '../api/api.model';
import { UserUpdateDto } from './user-update.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlingService = inject(ErrorHandlingService);
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

  async updateUser(uid: string, userData: UserUpdateDto): Promise<User> {
    const body: ApiBody = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      displayName: userData.displayName,
      avatarColor: userData.avatarColor,
    };

    try {
      const restOperation = await this.apiService.executePutOperation(`/users/${uid}`, body);
      const response = await restOperation.response;
      const updatedUser = (await response.body.json()) as unknown as User;
      this.notificationService.show('Profile updated successfully', 'success');
      return updatedUser;
    } catch (error) {
      this.errorHandlingService.handle(error);
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
