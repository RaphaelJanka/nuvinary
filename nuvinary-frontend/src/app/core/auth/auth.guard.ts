import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = await authService.checkAuthStatus();

  if (isLoggedIn) {
    if (state.url.includes('/signin')) {
      return router.parseUrl('/dashboard');
    }
    return true;
  }

  if (state.url.includes('/signin')) {
    return true;
  }

  return router.parseUrl('auth/signin');
};
