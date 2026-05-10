import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FieldState, FormField } from '@angular/forms/signals';
import { INPUT_CONFIGS, InputTypes } from './form-input.model';

let nextUniqueId = 0;

@Component({
  selector: 'app-form-input',
  imports: [FormField],
  template: `
    <div class="flex flex-col gap-2">
      <label
        [attr.for]="controlId"
        [class.sr-only]="shouldHideLabel()"
        [class.text-zinc-500]="purpose() === 'collection'"
        class="ml-1 font-bold text-brand  text-[10px] uppercase tracking-[0.15em]"
        >{{ displayLabel() }}</label
      >

      <div class="grid grid-cols-[1fr_auto] items-center" [class.gap-4]="hasContent()">
        <input
          [id]="controlId"
          [type]="displayType()"
          [placeholder]="displayPlaceholder()"
          [formField]="field()"
          [class.ring-2]="purpose() === 'collection'"
          [class.bg-white]="purpose() === 'collection'"
          [class.ring-zinc-200]="purpose() === 'collection'"
          [class.ring-form-success]="isSuccessState()"
          class=" rounded-xl bg-page-bg/30 px-4 py-3 placeholder:text-sm focus:border-brand/40 focus:ring-2 focus:ring-form-focus transition-all"
        />
        @if (hasContent()) {
          <div class="col-start-2">
            <ng-content></ng-content>
          </div>
        }
      </div>
      <div class="min-h-5 ps-1">
        @if (state().touched() && state().invalid()) {
          @for (error of state().errors(); track error.message) {
            <p class="text-xs text-red-500 font-medium leading-tight">
              {{ error.message }}
            </p>
          }
        }
      </div>
    </div>
  `,
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
}
