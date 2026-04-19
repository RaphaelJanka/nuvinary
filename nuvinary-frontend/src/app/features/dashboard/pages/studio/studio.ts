import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import {
  BadgeX,
  Check,
  Download,
  LucideAngularModule,
  Pen,
  Plus,
  RotateCwSquare,
  SwatchBook,
} from 'lucide-angular';
import { DialogService } from '../../../../shared/services/dialog-service';
import { NgClass } from '@angular/common';
import { toPng } from 'html-to-image';

@Component({
  selector: 'app-studio',
  imports: [PageLayout, LucideAngularModule, NgClass],
  templateUrl: './studio.html',
  styleUrl: './studio.css',
})
export class Studio {
  private readonly dialogService = inject(DialogService);
  protected readonly selectedCreation = this.dialogService.selectedCreation;
  protected isEditing = false;
  protected storyTitle = signal('');
  protected readonly orientation = signal<'portrait' | 'landscape'>('portrait');
  protected readonly cardBackground = signal('images/paisley.webp');
  private readonly iconRotation = signal(0);
  private readonly studioCard = viewChild<ElementRef<HTMLElement>>('studioCard');
  protected readonly isGenerating = signal(false);

  protected readonly toolbarButtons = [
    {
      icon: () => Plus,
      action: () => this.dialogService.openStudioDialog(),
      className: () => 'bg-brand text-black shadow-lg hover:bg-brand/80',
    },
    {
      icon: () => (this.isEditing ? Check : Pen),
      action: () => (this.isEditing = !this.isEditing),
      className: () => (this.isEditing ? 'text-white bg-brand/40 shadow-lg' : ''),
    },
    {
      icon: () => RotateCwSquare,
      action: () => this.toggleOrientation(),
      className: () => (this.orientation() === 'landscape' ? 'rotate-90' : ''),
    },
    {
      icon: () => SwatchBook,
      action: () => this.switchBackground(),
      iconClass: () => `transition-transform duration-500 ease-in-out`,
      iconStyle: () => `transform: rotate(${this.iconRotation()}deg)`,
    },
    {
      icon: () => BadgeX,
      action: () => this.clearStudio(),
      className: () => 'disabled:opacity-10',
      disabled: () => !this.selectedCreation() && this.storyTitle() === '',
    },
    {
      icon: () => Download,
      action: () => this.exportAsImage(),
      className: () => 'disabled:opacity-10',
      disabled: () => !this.selectedCreation() || this.storyTitle() === '',
    },
  ];

  protected readonly cornerClasses = [
    'top-0 left-0 border-t-2 border-l-2 rounded-tl-lg',
    'top-0 right-0 border-t-2 border-r-2 rounded-tr-lg',
    'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg',
    'bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg',
  ];

  private readonly cardBackgrounds = [
    'images/paisley.webp',
    'images/geometric-leaves.webp',
    'images/circles-and-roundabouts.webp',
    'images/intersection.webp',
    'images/regal.webp',
    'images/sun-pattern.png',
    'images/swirl_pattern.png',
  ];

  switchBackground() {
    const current = this.cardBackground();
    const currentIndex = this.cardBackgrounds.indexOf(current);
    const nextIndex = (currentIndex + 1) % this.cardBackgrounds.length;
    this.cardBackground.set(this.cardBackgrounds[nextIndex]);

    this.iconRotation.update((v) => v + 360 / this.cardBackgrounds.length);
  }

  toggleOrientation() {
    this.orientation.update((current) => (current === 'portrait' ? 'landscape' : 'portrait'));
  }

  clearStudio() {
    this.storyTitle.set('');
    this.dialogService.clearSelectedCreation();
  }

  exportAsImage() {
    if (!this.selectedCreation() || this.storyTitle() === '') return;

    const node = this.studioCard()?.nativeElement;
    if (!node) {
      console.error('Studio card element not found!');
      return;
    }

    this.isGenerating.set(true);

    toPng(node, { quality: 1, pixelRatio: 2, cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `nuvinary-export-${this.storyTitle()}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error('Error exporting image:', error);
      })
      .finally(() => {
        setTimeout(() => {
          this.isGenerating.set(false);
          this.storyTitle.set('');
          this.dialogService.clearSelectedCreation();
        }, 600);
      });
  }
}
