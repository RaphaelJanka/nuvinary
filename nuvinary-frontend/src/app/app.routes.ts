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
    ],
  },
  { path: '**', redirectTo: '' },
];
