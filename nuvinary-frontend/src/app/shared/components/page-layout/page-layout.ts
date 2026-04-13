import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-layout',
  imports: [],
  templateUrl: './page-layout.html',
})
export class PageLayout {
  title = input.required<string>();
}
