import { afterNextRender, Component, ElementRef, OnDestroy, viewChild } from '@angular/core';
import { Header } from './header/header';

interface VantaEffect {
  destroy: () => void;
}

declare const VANTA: {
  CLOUDS: (config: unknown) => VantaEffect;
};

@Component({
  selector: 'app-home',
  imports: [Header],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnDestroy {
  private vantaEffect?: VantaEffect;
  private vantaContainer = viewChild.required<ElementRef<HTMLElement>>('vantaContainer');

  constructor() {
    afterNextRender(() => {
      if (typeof VANTA !== 'undefined') {
        this.vantaEffect = VANTA.CLOUDS({
          el: this.vantaContainer().nativeElement,
          mouseControls: false,
          touchControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          speed: 0.3,
          skyColor: 0xedadb0,
          cloudColor: 0xadadde,
          cloudShadowColor: 0x183550,
          sunColor: 0xffbb18,
          sunGlareColor: 0xffb530,
          sunLightColor: 0xff9130,
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }
}
