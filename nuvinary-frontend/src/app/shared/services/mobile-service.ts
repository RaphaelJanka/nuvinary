import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MobileService {
  private readonly isMobile = signal<boolean>(false);
  readonly _isMobile = this.isMobile.asReadonly();

  constructor() {
    this.checkWidth(window.innerWidth);
    fromEvent(window, 'resize').subscribe(() => {
      this.checkWidth(window.innerWidth);
    });
  }

  private checkWidth(width: number): void {
    this.isMobile.set(width < 1024);
  }
}
