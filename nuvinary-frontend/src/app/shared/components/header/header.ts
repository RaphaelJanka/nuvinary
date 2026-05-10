import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { filter } from 'rxjs/internal/operators/filter';
import { NgClass } from '@angular/common';
import { Button } from '../button/button';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NgClass, Button],
  templateUrl: './header.html',
})
export class Header {
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event: NavigationEnd) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isLandingPage = computed(() => this.url() === '/');
}
