import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Footer } from '../../shared/components/footer/footer';
import { Header } from '../../shared/components/header/header';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { Location } from '@angular/common';

@Component({
  selector: 'app-legal',
  imports: [RouterOutlet, Footer, Header, LucideAngularModule],
  template: `
    <div class="min-h-screen flex flex-col gap-8">
      <app-header class="w-full block"></app-header>
      <main class="flex-1 flex items-center justify-center">
        <div class="max-w-4xl rounded-xl p-8 shadow-md bg-white">
          <button
            (click)="onBack()"
            class="flex items-center gap-2 w-fit mb-4 text-sm hover:text-primary"
          >
            <lucide-angular [img]="backIcon" class="w-5 h-5" />
            <p>Back</p>
          </button>
          <router-outlet />
        </div>
      </main>
      <app-footer class="w-full block"></app-footer>
    </div>
  `,
})
export class LegalLayout {
  protected readonly backIcon = ArrowLeft;
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  protected onBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
