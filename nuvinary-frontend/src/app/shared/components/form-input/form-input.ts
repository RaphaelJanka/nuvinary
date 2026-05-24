import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FieldState, FormField } from '@angular/forms/signals';
import { INPUT_CONFIGS, InputTypes } from './form-input.model';

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
      'flex flex-col xl:grid xl:grid-cols-[1fr_auto] xl:items-center',
      this.hasContent() ? 'gap-4' : null,
      this.purpose() === 'detail' ? 'bg-white py-2 px-4 rounded-xl' : null,
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly labelClasses = computed(() => {
    return [
      'ml-1 font-bold text-[10px] uppercase tracking-widest',
      this.shouldHideLabel() ? 'sr-only' : null,
      this.purpose() === 'collection' ? '' : 'text-accent',
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected readonly inputClasses = computed(() => {
    return [
      'rounded-xl py-3 text-sm xs:text-base focus:border-accent-muted focus:ring-form-focus text-text-emphasis transition-all placeholder:text-[10px] xl:placeholder:text-sm 3xl:placeholder:text-base',
      this.hasContent() ? 'max-w-[200px] xs:max-w-none' : '',
      this.purpose() !== 'detail' ? 'px-4 placeholder:text-sm focus:ring-2' : null,
      this.purpose() === 'detail'
        ? 'text-primary font-black text-xl md:text-3xl max-w-[150px] md:max-w-[300px] placeholder:text-xl md:placeholder:text-3xl'
        : null,
      this.purpose() === 'collection' ? ' ring-2 ring-slate-200' : null,
      this.purpose() === 'collection' || this.purpose() === 'detail' ? 'bg-white' : 'bg-surface/30',
      this.isSuccessState() ? 'ring-form-success' : null,
    ]
      .filter(Boolean)
      .join(' ');
  });
}
