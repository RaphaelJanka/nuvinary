import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

@Component({
  selector: 'app-loader',
  imports: [LottieComponent],
  template: ` <ng-lottie class="h-full w-auto" [options]="options"></ng-lottie>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full',
  },
})
export class Loader {
  animationPath = 'animations/loading.json';

  options: AnimationOptions = {
    path: this.animationPath,
    loop: true,
    autoplay: true,
  };
}
