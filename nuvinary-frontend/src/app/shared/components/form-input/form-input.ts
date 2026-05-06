import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { FieldState, FormField } from '@angular/forms/signals';

let nextUniqueId = 0;

@Component({
  selector: 'app-form-input',
  imports: [FormField],
  template: `
    <div class="flex flex-col gap-2">
      <label
        [attr.for]="controlId"
        class="ml-1 text-[10px] font-bold text-brand uppercase tracking-widest"
        >{{ label() }}</label
      >

      <div class="grid grid-cols-[1fr_auto] items-center gap-4">
        <input
          [id]="controlId"
          [type]="type()"
          [placeholder]="placeholder()"
          [formField]="field()"
          [class.ring-2]="state().valid()"
          [class.ring-form-success]="state().valid()"
          class="bg-page-bg/30 rounded-xl px-4 py-3 placeholder:text-sm focus:border-brand/40 focus:ring-2 focus:ring-form-focus transition-all"
        />
        <div class="col-start-2">
          <ng-content></ng-content>
        </div>
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
  field = input.required<() => FieldState<string>>();
  state = computed(() => this.field()());
  label = input.required<string>();
  placeholder = input.required<string>();
  type = input.required<string>();
  readonly controlId = `form-input-${nextUniqueId++}`;
}
