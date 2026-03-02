import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.authUser()) {
    return true; // User ist im Signal (LocalStorage), darf durch
  }

  // Nicht eingeloggt? Ab zum Login
  return router.parseUrl('/login');
};
