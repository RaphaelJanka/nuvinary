import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly _collapsedSignal = signal(false);

  isCollapsed = this._collapsedSignal.asReadonly();

  toggle() {
    this._collapsedSignal.update((collapsed) => !collapsed);
  }
}
