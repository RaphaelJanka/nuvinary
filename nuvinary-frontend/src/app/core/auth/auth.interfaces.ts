export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  uid: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  credits: number;
  createdAt: string;
  displayName?: string;
  avatarConfig: {
    type: 'image' | 'color';
    value: string;
  };
}
