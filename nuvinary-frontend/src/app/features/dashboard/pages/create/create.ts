import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { typeWriter } from './typewriter.helper';
import { ArrowRight, CloudUpload, LucideAngularModule } from 'lucide-angular';
import { CreationModel, CreationService } from '../../../services/creation-service';
import { form, maxLength, required, FormField } from '@angular/forms/signals';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { Button } from '../../../../shared/components/button/button';
import { DialogService } from '../../../../shared/services/dialog-service';

const THINKING_DELAY_MS = 1500;

@Component({
  selector: 'app-create',
  imports: [LucideAngularModule, FormField, PageLayout, Button],
  templateUrl: './create.html',
  styleUrl: './create.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class Create {
  private readonly creationService = inject(CreationService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  protected readonly authUser = this.authService.authUser();
  private readonly creationModel = signal<CreationModel>(
    this.creationService.getDefaultCreationModel(),
  );

  protected readonly creationForm = form(this.creationModel, (creationSchema) => {
    required(creationSchema.prompt);
    required(creationSchema.title);
    maxLength(creationSchema.title, 20);
    maxLength(creationSchema.prompt, 250);
  });

  protected readonly displayedUserGreeting = signal('');
  protected readonly displayedText = signal('');
  protected readonly currentStep = signal<'prompt' | 'title'>('prompt');
  protected readonly isTyping = signal(false);
  protected readonly isThinking = signal(false);

  private readonly userGreeting = `Hi, ${this.authUser?.firstName ?? 'there'}!`;
  private readonly greetings = [
    'Time to create a vision. Describe your image...',
    "Let's bring your imagination to life. What should I draw?",
    "A blank canvas is waiting. What's on your mind?",
  ];
  protected readonly icons = {
    arrowRightIcon: ArrowRight,
    cloudUploadIcon: CloudUpload,
  };

  constructor() {
    this.isTyping.set(true);
    typeWriter(
      this.userGreeting,
      (g) => this.displayedUserGreeting.set(g),
      () => {
        setTimeout(() => this.setMessage(), 400);
      },
    );
  }

  /** Types `text` into `displayedText`, mimicking the assistant "speaking". */
  private say(text: string, onComplete?: () => void) {
    this.isTyping.set(true);
    typeWriter(
      text,
      (t) => this.displayedText.set(t),
      () => {
        this.isTyping.set(false);
        onComplete?.();
      },
    );
  }

  private setMessage() {
    const text = this.greetings[Math.floor(Math.random() * this.greetings.length)];
    this.say(text);
  }

  protected async onSetTitle() {
    this.isThinking.set(true);
    this.displayedText.set('');

    await new Promise((r) => setTimeout(r, THINKING_DELAY_MS));

    this.isThinking.set(false);
    this.currentStep.set('title');
    this.say('That sounds like a great vision! Now, what should we call this piece?');
  }

  protected onBack() {
    this.currentStep.set('prompt');
    this.displayedText.set('');
    this.creationModel.update((model) => ({
      ...model,
      title: '',
    }));
    this.setMessage();
  }

  protected async onSubmit(event: Event) {
    event.preventDefault();
    if (this.currentStep() !== 'title') {
      return;
    }
    if (!this.creationForm().valid()) {
      return;
    }

    this.isThinking.set(true);
    this.displayedText.set('');

    try {
      const creation = await this.creationService.generateCreation(this.creationModel());
      this.isThinking.set(false);
      this.resetForm();
      this.say(`I named it "${creation.title}" for you. Take a look!`, () => {
        this.dialogService.openCreationResult(creation);
      });
    } catch (err) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : 'Something went wrong while generating your image.';
      this.isThinking.set(false);
      this.currentStep.set('prompt');
      this.say(message);
    }
  }

  private resetForm() {
    this.creationForm().reset();
    this.creationModel.set(this.creationService.getDefaultCreationModel());
  }
}
