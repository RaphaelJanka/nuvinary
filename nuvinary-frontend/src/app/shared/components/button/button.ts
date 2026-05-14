import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, LucideIconData } from 'lucide-angular';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonType = 'button' | 'submit';

@Component({
  selector: 'app-button',
  imports: [LucideAngularModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="disabled() ? 'bg-gray-300 shadow-none' : variantClasses"
      [class.mt-4]="variant() === 'primary' && fullWidth()"
      [class.min-w-30]="!fullWidth()"
      [class.min-w-40]="fullWidth()"
      [class.text-sm]="(variant() === 'secondary' || variant() === 'danger') && !icon()"
      class="flex flex-1 px-2 py-3 rounded-xl font-bold text-white items-center justify-center gap-2"
    >
      @if (iconPosition() === 'left' && icon()) {
        <lucide-icon [img]="icon()" class="w-5 h-5"></lucide-icon>
      }
      {{ label() }}
      @if (iconPosition() === 'right' && icon()) {
        <lucide-icon [img]="icon()" class="w-5 h-5"></lucide-icon>
      }
    </button>
  `,
  host: {
    class: 'w-full flex',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Button {
  disabled = input<boolean>(false);
  label = input.required<string>();
  type = input<ButtonType>('button');
  variant = input<ButtonVariant>('primary');
  icon = input<LucideIconData>();
  iconPosition = input<'left' | 'right'>('right');
  fullWidth = input<boolean>(true);

  get variantClasses() {
    const baseClasses =
      'shadow-lg active:scale-95 hover:transition-all active:transition-all active:duration-300 hover:duration-300';
    switch (this.variant()) {
      case 'primary':
        return `bg-accent shadow-accent-subtle hover:bg-accent-light ${baseClasses}`;
      case 'secondary':
        return `bg-primary shadow-bg-primary-subtle hover:bg-primary-hover ${baseClasses}`;
      case 'danger':
        return `bg-danger shadow-danger hover:bg-danger-hover ${baseClasses}`;
      case 'ghost':
        return `border border-white-soft bg-white-glassbackdrop-blur-sm hover:bg-accent-light hover:border-accent-light hover:shadow-accent-light/50 ${baseClasses}`;
      default:
        return '';
    }
  }
}
