import { User } from '../../core/auth/auth.interfaces';

export const testUser: User = {
  uid: '101',
  email: 'test@example.com',
  password: 'password1234',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  credits: 10,
  createdAt: new Date().toISOString(),
  avatarConfig: {
    type: 'color',
    value: '#D97706',
  },
};
