export interface BaseUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UserRegistrationForm extends BaseUser {
  password: string;
  confirmPassword: string;
}

export interface SignUpRequestDTO extends Omit<UserRegistrationForm, 'confirmPassword'> {
  avatarColor: string;
  displayName: string;
}

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  credits: number;
  createdAt: string;
  displayName: string;
  avatarColor: string;
}
