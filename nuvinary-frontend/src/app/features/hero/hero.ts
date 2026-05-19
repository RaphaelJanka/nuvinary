import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { Button } from '../../shared/components/button/button';

@Component({
  selector: 'app-hero',
  imports: [Header, RouterLink, LucideAngularModule, Button],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly arrowIcon = ArrowRight;
}
