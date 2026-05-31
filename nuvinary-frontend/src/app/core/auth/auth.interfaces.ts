export interface BaseUser {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginData extends Pick<BaseUser, 'email'> {
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

export interface User extends BaseUser {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  credits: number;
  createdAt: string;
  displayName: string;
  avatarColor: string;
}
