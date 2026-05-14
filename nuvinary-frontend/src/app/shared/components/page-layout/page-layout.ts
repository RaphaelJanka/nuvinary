import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  imports: [],
  templateUrl: './page-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageLayout {
  title = input.required<string>();
}
