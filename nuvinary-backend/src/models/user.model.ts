export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  credits: number;
  createdAt: string;
  displayName: string;
  avatarColor: string;
}

export const AVATAR_COLORS = [
  '#D97706',
  '#1D4ED8',
  '#047857',
  '#7C3AED',
  '#BE123C',
  '#334155',
  '#0F766E',
];
