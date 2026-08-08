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
