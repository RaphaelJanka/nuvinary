import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Welcome',
    loadComponent: () => import('./features/landing-page/hero/hero').then((m) => m.Hero),
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
      {
        path: 'gallery',
        title: 'Gallery',
        loadComponent: () =>
          import('./features/dashboard/pages/gallery/gallery').then((m) => m.Gallery),
      },
      {
        path: 'studio',
        title: 'Studio',
        loadComponent: () =>
          import('./features/dashboard/pages/studio/studio').then((m) => m.Studio),
      },
      {
        path: 'create',
        title: 'Create',
        loadComponent: () =>
          import('./features/dashboard/pages/create/create').then((m) => m.Create),
      },
      {
        path: 'community',
        title: 'Community',
        loadComponent: () =>
          import('./features/dashboard/pages/community/community').then((m) => m.Community),
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            title: 'Profile Settings',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/profile/profile').then((m) => m.Profile),
          },
          {
            path: 'overview',
            title: 'Account Overview',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/overview/overview').then(
                (m) => m.Overview,
              ),
          },
          {
            path: 'security',
            title: 'Security',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/security/security').then(
                (m) => m.Security,
              ),
          },
          {
            path: 'preferences',
            title: 'Preferences',
            loadComponent: () =>
              import('./features/dashboard/pages/settings/preferences/preferences').then(
                (m) => m.Preferences,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
