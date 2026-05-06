import { SchemaPath, validate } from '@angular/forms/signals';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{8,}$/;

export function verifyName(path: SchemaPath<string>, label: string) {
  validate(path, ({ value }) => {
    if (!value()) {
      return {
        kind: 'name_empty',
        message: `${label} is required.`,
      };
    }
    if (value().length < 3) {
      return {
        kind: 'name_too_short',
        message: `${label} is too short.`,
      };
    }
    return null;
  });
}

export function verifyCode(path: SchemaPath<string>) {
  validate(path, ({ value }) => {
    if (!value()) {
      return {
        kind: 'code_empty',
        message: 'Verification code is required.',
      };
    }
    if (!CODE_PATTERN.test(value())) {
      return {
        kind: 'verification_code_pattern',
        message: 'Verification code must be 6 digits long.',
      };
    }
    return null;
  });
}

export function verifyPassword(path: SchemaPath<string>) {
  validate(path, ({ value }) => {
    if (!value()) {
      return {
        kind: 'password_empty',
        message: 'Password is required.',
      };
    }

    if (value().length < 8) {
      return {
        kind: 'password_too_short',
        message: 'Password must be at least 8 characters long',
      };
    }

    if (!PASSWORD_PATTERN.test(value())) {
      return {
        kind: 'password_pattern',
        message: 'Must include uppercase, lowercase, number, and special character',
      };
    }
    return null;
  });
}

export function verifyConfirmPassword(path: SchemaPath<string>, matchingPath: SchemaPath<string>) {
  validate(path, ({ value, valueOf }) => {
    const confirmPassword = value();
    const password = valueOf(matchingPath);

    if (!confirmPassword) {
      return {
        kind: 'confirmPassword_empty',
        message: 'Password is required',
      };
    }

    if (confirmPassword !== password) {
      return {
        kind: 'confirmPassword_mismatch',
        message: 'Passwords do not match.',
      };
    }
    return null;
  });
}

export function verifyEmail(path: SchemaPath<string>) {
  validate(path, ({ value }) => {
    if (!value()) {
      return {
        kind: 'email_empty',
        message: 'Email is required.',
      };
    }
    if (!EMAIL_PATTERN.test(value())) {
      return {
        kind: 'email_pattern',
        message: 'Please enter a valid email address.',
      };
    }
    return null;
  });
}
