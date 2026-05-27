import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScreenSizeService {
  private readonly _mobileSignal = signal<boolean>(false);
  readonly isMobile = this._mobileSignal.asReadonly();

  private _desktopSignal = signal<boolean>(true);
  readonly isDesktop = this._desktopSignal.asReadonly();

  constructor() {
    this.checkWidth(window.innerWidth);
    fromEvent(window, 'resize').subscribe(() => {
      this.checkWidth(window.innerWidth);
    });
  }

  private checkWidth(width: number): void {
    this._mobileSignal.set(width < 1024);
    this._desktopSignal.set(width >= 1280);
  }
}
