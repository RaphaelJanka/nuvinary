import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import {
  BookImage,
  ChartLine,
  CircleUserRound,
  Earth,
  LockOpen,
  PencilRuler,
  Sparkles,
} from 'lucide-angular';
import { ScreenSizeService } from '../../shared/services/screen-size-service';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly router = inject(Router);
  private readonly screenSizeService = inject(ScreenSizeService);

  readonly dashboardNavItems = [
    { label: 'My Gallery', icon: BookImage, route: '/dashboard/gallery' },
    { label: 'Create', icon: PencilRuler, route: '/dashboard/create' },
    { label: 'Studio', icon: Sparkles, route: '/dashboard/studio' },
    { label: 'Community', icon: Earth, route: '/dashboard/community' },
  ];

  readonly settingsNavItems = [
    { label: 'Profile Settings', icon: CircleUserRound, route: '/dashboard/settings/profile' },
    { label: 'Account Overview', icon: ChartLine, route: '/dashboard/settings/overview' },
    { label: 'Security & Password', icon: LockOpen, route: '/dashboard/settings/security' },
  ];

  readonly legalNavItems = [
    { label: 'Legal Notice', route: '/legal/legal-notice' },
    { label: 'Privacy Policy', route: '/legal/privacy-policy' },
    { label: 'Terms of Service', route: '/legal/terms-of-service' },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  readonly showSettings = computed(() => this.currentUrl().includes('/dashboard/settings'));

  private readonly _collapsedSignal = signal(false);
  readonly isCollapsed = this._collapsedSignal.asReadonly();

  private readonly _mobileSidebarSignal = signal(false);
  readonly isMobileSidebarOpen = this._mobileSidebarSignal.asReadonly();

  toggle() {
    if (this.screenSizeService.isMobile()) {
      this._mobileSidebarSignal.update((collapsed) => !collapsed);
    } else {
      this._collapsedSignal.update((collapsed) => !collapsed);
    }
  }

  setCollapsed(collapsed: boolean) {
    this._collapsedSignal.set(collapsed);
  }
}
