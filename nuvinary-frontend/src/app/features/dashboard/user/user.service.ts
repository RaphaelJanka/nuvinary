import { inject, Injectable } from '@angular/core';
import { NotificationService } from '../../../core/feedback/notification.service';
import { ErrorHandlingService } from '../../../core/feedback/error-handling.service';
import { User } from '../../../shared/models/user.model';
import { ApiService } from '../../../core/api/api.service';
import { ApiBody } from '../../../core/api/api.model';
import { UserUpdateDto } from './user-update.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly notificationService = inject(NotificationService);
  private readonly errorHandlingService = inject(ErrorHandlingService);
  private readonly apiService = inject(ApiService);

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
