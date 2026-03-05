import { computed, inject, Injectable, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly _collapsedSignal = signal(false);
  readonly isCollapsed = this._collapsedSignal.asReadonly();

  private readonly router = inject(Router);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => (event as NavigationEnd).urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly showSettings = computed(() => this.currentUrl().includes('/dashboard/settings'));

  toggle() {
    this._collapsedSignal.update((collapsed) => !collapsed);
  }
}
