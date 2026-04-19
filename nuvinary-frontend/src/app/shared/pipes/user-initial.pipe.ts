import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../../core/auth/auth.interfaces';

@Pipe({
  name: 'userInitial',
})
export class UserInitialPipe implements PipeTransform {
  transform(user: User | null): string {
    if (!user) {
      return '??';
    }
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  }
}
