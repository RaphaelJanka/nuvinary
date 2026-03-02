import { Routes } from '@angular/router';

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
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard), // Add AuthGuard here when implemented
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
