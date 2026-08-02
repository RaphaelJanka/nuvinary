import { inject, Injectable } from '@angular/core';
import { ApiError } from 'aws-amplify/api';
import { AuthError } from 'aws-amplify/auth';
import { NotificationService } from './notification-service';

const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlingService {
  private readonly notificationService = inject(NotificationService);

  /** Logs the error once, shows a user-facing error notification, and returns the message. */
  handle(err: unknown): string {
    console.error(err);
    const message =
      this.extractBackendMessage(err) ??
      this.extractAuthMessage(err) ??
      (this.isNetworkError(err) ? NETWORK_ERROR_MESSAGE : GENERIC_ERROR_MESSAGE);
    this.notificationService.show(message, 'error');
    return message;
  }

  /** Reads the backend-authored message out of a REST API error response, if present. */
  private extractBackendMessage(err: unknown): string | undefined {
    if (!(err instanceof ApiError) || !err.response?.body) {
      return undefined;
    }
    try {
      const body = JSON.parse(err.response.body) as { message?: string };
      return body.message;
    } catch {
      return undefined;
    }
  }

  /** Reads the message out of a Cognito auth error, if present. */
  private extractAuthMessage(err: unknown): string | undefined {
    return err instanceof AuthError ? err.message : undefined;
  }

  /** True when the request never reached the backend (offline, CORS, DNS, timeout). */
  private isNetworkError(err: unknown): boolean {
    return err instanceof ApiError && !err.response;
  }
}
