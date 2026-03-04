import { Routes } from '@angular/router';
import { authGuard } from './auth/guard/auth-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Welcome',
    loadComponent: () => import('./components/hero/hero').then((m) => m.Hero),
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./components/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
      {
        path: 'gallery',
        title: 'Gallery',
        loadComponent: () =>
          import('./components/dashboard/gallery/gallery').then((m) => m.Gallery),
      },
      {
        path: 'visionboard',
        title: 'Vision Board',
        loadComponent: () =>
          import('./components/dashboard/visionboard/visionboard').then((m) => m.VisionBoard),
      },
      {
        path: 'settings',
        children: [
          {
            path: 'profile',
            title: 'Profile Settings',
            loadComponent: () =>
              import('./components/dashboard/settings/profile/profile').then((m) => m.Profile),
          },
          {
            path: 'overview',
            title: 'Account Overview',
            loadComponent: () =>
              import('./components/dashboard/settings/overview/overview').then((m) => m.Overview),
          },
          {
            path: 'security',
            title: 'Security',
            loadComponent: () =>
              import('./components/dashboard/settings/security/security').then((m) => m.Security),
          },
          {
            path: 'preferences',
            title: 'Preferences',
            loadComponent: () =>
              import('./components/dashboard/settings/preferences/preferences').then(
                (m) => m.Preferences,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
