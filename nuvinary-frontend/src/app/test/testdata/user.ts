import { User } from '../../shared/models/user.model';

export const testUser: User = {
  uid: '101',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  credits: 10,
  createdAt: new Date().toISOString(),
  avatarColor: '#D97706',
};
