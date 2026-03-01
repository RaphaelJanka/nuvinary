import {
  afterNextRender,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  viewChild,
} from '@angular/core';
import { Header } from './header/header';
import * as THREE from 'three';
import CLOUDS, { VantaEffect } from 'vanta/dist/vanta.clouds.min.js';

interface VantaWindow extends Window {
  THREE?: typeof THREE;
}

@Component({
  selector: 'app-hero',
  imports: [Header],
  templateUrl: './hero.html',
})
export class Hero implements OnDestroy {
  private vantaEffect?: VantaEffect;
  private vantaContainer = viewChild.required<ElementRef<HTMLElement>>('vantaContainer');

  @HostListener('window:resize')
  onResize() {
    this.vantaEffect?.resize();
  }

  constructor() {
    afterNextRender(() => {
      (window as VantaWindow).THREE = THREE;

      this.vantaEffect = CLOUDS({
        el: this.vantaContainer().nativeElement,
        THREE: THREE,
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
    });
  }

  ngOnDestroy(): void {
    if (this.vantaEffect) {
      this.vantaEffect.destroy();
    }
  }
}
