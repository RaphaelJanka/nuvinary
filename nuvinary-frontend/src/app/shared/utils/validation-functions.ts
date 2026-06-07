import { SchemaPath, validate } from '@angular/forms/signals';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_-])[A-Za-z\d@$!%*?&_-]{12,}$/;
export const DELETE_PHRASE = 'Delete my account';

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

    if (value().length < 12) {
      return {
        kind: 'password_too_short',
        message: 'Password must be at least 12 characters long',
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

export function verifyNewPassword(path: SchemaPath<string>, matchingPath: SchemaPath<string>) {
  validate(path, ({ value, valueOf }) => {
    const newPassword = value();
    const oldPassword = valueOf(matchingPath);

    if (!newPassword) {
      return {
        kind: 'password_empty',
        message: 'Password is required.',
      };
    }

    if (newPassword.length < 12) {
      return {
        kind: 'password_too_short',
        message: 'Password must be at least 12 characters long',
      };
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      return {
        kind: 'password_pattern',
        message: 'Must include uppercase, lowercase, number, and special character',
      };
    }

    if (newPassword === oldPassword) {
      return {
        kind: 'newPassword_match_oldPassword',
        message: 'The new password must be different from your current password.',
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

export function verifyAccountDeletion(path: SchemaPath<string>) {
  validate(path, ({ value }) => {
    if (!value()) {
      return {
        kind: 'delete_phrase_empty',
        message: `Phrase "${DELETE_PHRASE}" is required`,
      };
    }
    if (DELETE_PHRASE !== value()) {
      return {
        kind: 'delete_pattern',
        message: 'Phrase does not match!',
      };
    }
    return null;
  });
}
