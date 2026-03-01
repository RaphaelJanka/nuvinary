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
    path: 'app',
    loadComponent: () => import('./components/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', redirectTo: 'gallery', pathMatch: 'full' },
      {
        path: 'gallery',
        title: 'Gallery',
        loadComponent: () =>
          import('./components/app-shell/gallery/gallery').then((m) => m.Gallery),
      },
      {
        path: 'visionboard',
        title: 'Vision Board',
        loadComponent: () =>
          import('./components/app-shell/visionboard/visionboard').then((m) => m.VisionBoard),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
