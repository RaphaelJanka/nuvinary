export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  credits: number;
}
