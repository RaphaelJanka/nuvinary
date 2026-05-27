import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
})
export class Tooltip implements OnDestroy {
  readonly tooltipText = input<string>('', { alias: 'appTooltip' });
  readonly tooltipPosition = input<'top' | 'right' | 'left'>('top');
  private tooltipElement: HTMLElement | null = null;
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly tooltipClasses = [
    'fixed',
    'z-[9999]',
    'px-3',
    'py-1.5',
    'text-xs',
    'font-medium',
    'text-white',
    'bg-black/85',
    'backdrop-blur-md',
    'rounded-xl',
    'shadow-xl',
    'pointer-events-none',
    'transition-all',
    'duration-200',
    'animate-in',
    'fade-in',
    'zoom-in-95',
  ];

  @HostListener('mouseenter') onMouseEnter() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (!this.tooltipElement && this.tooltipText()) {
      this.showTooltip();
    }
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.hideTooltip();
  }

  @HostListener('click') onClick() {
    this.hideTooltip();
  }

  private showTooltip() {
    this.tooltipElement = this.renderer.createElement('span');
    const message = this.renderer.createText(this.tooltipText());
    this.renderer.appendChild(this.tooltipElement, message);

    this.tooltipClasses.forEach((c) => this.renderer.addClass(this.tooltipElement, c));
    this.renderer.appendChild(document.body, this.tooltipElement);

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltipElement!.getBoundingClientRect();

    let top = 0;
    let left = 0;
    if (this.tooltipPosition() === 'right') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.right + 12;
    } else if (this.tooltipPosition() === 'left') {
      top = hostPos.top + (hostPos.height - tooltipPos.height) / 2;
      left = hostPos.left - tooltipPos.width - 12;
    } else {
      top = hostPos.top - tooltipPos.height - 8;
      left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;
    }
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private hideTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(document.body, this.tooltipElement);
      this.tooltipElement = null;
    }
  }

  ngOnDestroy() {
    this.hideTooltip();
  }
}
