import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Hero } from './features/hero/hero';

export const routes: Routes = [
  {
    path: '',
    title: 'Welcome',
    component: Hero,
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth').then((c) => c.Auth),
    children: [
      {
        path: 'signin',
        title: 'Sign In',
        loadComponent: () => import('./features/auth/sign-in/sign-in').then((c) => c.SignIn),
      },
      {
        path: 'signup',
        title: 'Sign Up',
        loadComponent: () => import('./features/auth/sign-up/sign-up').then((c) => c.SignUp),
      },
      {
        path: 'reset-password',
        title: 'Reset Password',
        loadComponent: () =>
          import('./features/auth/reset-password/reset-password').then((c) => c.ResetPassword),
      },
    ],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((c) => c.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
      {
        path: 'gallery',
        title: 'Gallery',
        loadComponent: () =>
          import('./features/dashboard/pages/gallery/gallery').then((c) => c.Gallery),
      },
      {
        path: 'studio',
        title: 'Studio',
        loadComponent: () =>
          import('./features/dashboard/pages/studio/studio').then((c) => c.Studio),
      },
      {
        path: 'create',
        title: 'Create',
        loadComponent: () =>
          import('./features/dashboard/pages/create/create').then((c) => c.Create),
      },
      {
        path: 'community',
        title: 'Community',
        loadComponent: () =>
          import('./features/dashboard/pages/community/community').then((c) => c.Community),
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            title: 'Profile Settings',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/profile/profile').then((c) => c.Profile),
          },
          {
            path: 'overview',
            title: 'Account Overview',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/overview/overview').then(
                (c) => c.Overview,
              ),
          },
          {
            path: 'security',
            title: 'Security',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/security/security').then(
                (c) => c.Security,
              ),
          },
        ],
      },
    ],
  },
  {
    path: 'legal',
    loadComponent: () => import('./features/legal/legal').then((c) => c.LegalLayout),
    children: [
      {
        path: 'terms-of-service',
        title: 'Terms of Service',
        loadComponent: () =>
          import('./features/legal/legal-content/legal-content').then((c) => c.LegalContent),
        data: { contentKey: 'TERMS' },
      },
      {
        path: 'privacy-policy',
        title: 'Privacy Policy',
        loadComponent: () =>
          import('./features/legal/legal-content/legal-content').then((c) => c.LegalContent),
        data: { contentKey: 'PRIVACY' },
      },
      {
        path: 'legal-notice',
        title: 'Legal Notice',
        loadComponent: () =>
          import('./features/legal/legal-content/legal-content').then((c) => c.LegalContent),
        data: { contentKey: 'NOTICE' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
