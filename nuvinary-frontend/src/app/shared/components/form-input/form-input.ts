import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FieldState, FormField } from '@angular/forms/signals';
import { INPUT_CONFIGS, InputTypes } from '../../models/form-input.model';

let nextUniqueId = 0;

@Component({
  selector: 'app-form-input',
  imports: [FormField],
  templateUrl: './form-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormInput {
  protected readonly controlId = `form-input-${nextUniqueId++}`;
  readonly field = input.required<() => FieldState<string>>();
  readonly state = computed(() => this.field()());
  protected readonly isSuccessState = computed(() => this.state().valid() && this.state().dirty());

  readonly purpose = input.required<InputTypes>();
  protected readonly config = computed(() => {
    const t = this.purpose();
    return t ? INPUT_CONFIGS[t] : null;
  });
  protected readonly displayLabel = computed(() => this.config()?.label);
  protected readonly displayPlaceholder = computed(() => this.config()?.placeholder);
  protected readonly displayType = computed(() => this.config()?.type);
  protected readonly shouldHideLabel = computed(() => this.config()?.hideLabelVisually);
  protected readonly hasContent = computed(() => this.config()?.content);
  protected readonly containerClasses = computed(() => {
    return [
      'grid grid-cols-[1fr_auto] items-center',
      this.hasContent() ? 'gap-4' : null,
      this.purpose() === 'detail' ? 'bg-white py-2 px-4 rounded-xl' : null,
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly labelClasses = computed(() => {
    return [
      'ml-1 font-bold text-[10px] uppercase tracking-[0.15em]',
      this.shouldHideLabel() ? 'sr-only' : null,
      this.purpose() === 'collection' ? 'text-zinc-500' : 'text-brand',
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly inputClasses = computed(() => {
    return [
      'rounded-xl py-3 focus:border-brand/40 focus:ring-form-focus transition-all',
      this.purpose() !== 'detail' ? 'px-4 placeholder:text-sm focus:ring-2' : null,
      this.purpose() === 'detail'
        ? 'text-text-main font-black text-3xl max-w-[300px] placeholder:text-3xl'
        : null,
      this.purpose() === 'collection' ? 'ring-2 ring-zinc-200' : null,
      this.purpose() === 'collection' || this.purpose() === 'detail' ? 'bg-white' : 'bg-page-bg/30',
      this.isSuccessState() ? 'ring-form-success' : null,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
