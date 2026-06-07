import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.authUser();
  const isAuthRoute = state.url.includes('/auth/');
  const isSignInRoute = state.url.includes('/signin');
  const isResetRoute = state.url.includes('/reset-password');

  if (user) {
    if (isSignInRoute || isResetRoute) {
      return router.parseUrl('/dashboard');
    }
    return true;
  }

  if (isAuthRoute) {
    return true;
  }

  return router.parseUrl('/auth/signin');
};
