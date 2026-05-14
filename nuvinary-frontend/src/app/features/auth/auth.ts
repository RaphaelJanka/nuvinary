import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { Footer } from '../../shared/components/footer/footer';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  imports: [Header, Footer, RouterOutlet],
  template: `
    <section class="flex flex-col justify-between min-h-screen">
      <app-header></app-header>
      <main class="flex-1 w-full p-8">
        <div
          class="mx-auto w-full bg-white max-w-xl p-8 rounded-4xl border border-border-gentle shadow-2xl"
        >
          <router-outlet />
        </div>
      </main>
      <app-footer></app-footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Auth {}
