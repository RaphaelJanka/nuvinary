import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { LottieComponent, AnimationOptions } from 'ngx-lottie';

const ANIMATION_PATHS: Record<'sparkle' | 'loader', string> = {
  sparkle: 'animations/ai-sparkle.json',
  loader: 'animations/loading.json',
};

@Component({
  selector: 'app-loader',
  imports: [LottieComponent],
  template: ` <ng-lottie class="h-full w-auto" [options]="options()"></ng-lottie>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'h-full',
  },
})
export class Loader {
  readonly loadType = input<'sparkle' | 'loader'>('loader');

  protected readonly options = computed<AnimationOptions>(() => ({
    path: ANIMATION_PATHS[this.loadType()],
    loop: true,
    autoplay: true,
  }));
}
