import { User } from '../../core/auth/auth.interfaces';

export const testUser: User = {
  uid: '101',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  credits: 10,
  createdAt: new Date().toISOString(),
  avatarColor: '#D97706',
};
