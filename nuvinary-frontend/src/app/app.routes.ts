import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { Hero } from './features/landing-page/hero/hero';

export const routes: Routes = [
  {
    path: '',
    title: 'Welcome',
    component: Hero,
  },
  {
    path: 'login',
    title: 'Login',
    loadComponent: () => import('./features/login/login').then((c) => c.Login),
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
          import('./features/legal/terms-of-service/terms-of-service').then(
            (c) => c.TermsOfService,
          ),
      },
      {
        path: 'privacy-policy',
        title: 'Privacy Policy',
        loadComponent: () =>
          import('./features/legal/privacy-policy/privacy-policy').then((c) => c.PrivacyPolicy),
      },
      {
        path: 'legal-notice',
        title: 'Legal Notice',
        loadComponent: () =>
          import('./features/legal/legal-notice/legal-notice').then((c) => c.LegalNotice),
      },
      {
        path: 'contact-support',
        title: 'Contact Support',
        loadComponent: () =>
          import('./features/legal/contact-support/contact-support').then((c) => c.ContactSupport),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
