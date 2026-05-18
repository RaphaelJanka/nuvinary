import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';

@Component({
  selector: 'app-hero',
  imports: [Header],
  templateUrl: './hero.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {}
