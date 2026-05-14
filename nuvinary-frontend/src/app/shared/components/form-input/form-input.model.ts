import { DELETE_PHRASE } from '../../utils/validation-functions';

export type InputTypes =
  | 'firstName'
  | 'lastName'
  | 'displayName'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'code'
  | 'updateEmail'
  | 'deleteAccount'
  | 'collection'
  | 'updateCollection'
  | 'detail';

export interface InputConfig {
  label: string;
  placeholder: string;
  type: 'text' | 'email' | 'password';
  hideLabelVisually?: boolean;
  content?: boolean;
}

export const INPUT_CONFIGS: Record<InputTypes, InputConfig> = {
  firstName: { label: 'First Name', placeholder: 'Enter your first name', type: 'text' },
  lastName: { label: 'Last Name', placeholder: 'Enter your last name', type: 'text' },
  displayName: { label: 'Display Name', placeholder: 'Enter your display name', type: 'text' },
  email: { label: 'Email Address', placeholder: 'Enter your email address', type: 'email' },
  password: { label: 'Password', placeholder: 'Enter your password', type: 'password' },
  confirmPassword: { label: 'Password', placeholder: 'Confirm your password', type: 'password' },
  code: { label: 'Code', placeholder: 'Enter 6-digit code', type: 'text', content: true },
  updateEmail: {
    label: 'Update Email',
    placeholder: 'Enter your new email address',
    type: 'email',
    hideLabelVisually: true,
    content: true,
  },
  deleteAccount: {
    label: 'Delete Account',
    placeholder: `${DELETE_PHRASE}`,
    type: 'text',
    hideLabelVisually: true,
    content: true,
  },
  collection: {
    label: 'New collection',
    placeholder: 'Enter collection name',
    type: 'text',
  },
  updateCollection: {
    label: 'Update Collection',
    placeholder: 'Enter new collection title',
    type: 'text',
    hideLabelVisually: true,
    content: true,
  },
  detail: {
    label: 'Edit Title',
    placeholder: 'Enter new title',
    type: 'text',
    hideLabelVisually: true,
    content: true,
  },
};
