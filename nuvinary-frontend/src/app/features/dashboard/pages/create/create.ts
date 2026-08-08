import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { typeWriter } from './typewriter';
import { ArrowRight, CloudUpload, LucideAngularModule } from 'lucide-angular';
import { CreationService } from '../../../../core/data/creation.service';
import { GenerateCreationDto } from '../../../../core/data/generate-creation.model';
import { form, maxLength, required, FormField } from '@angular/forms/signals';
import { AuthService } from '../../../../core/auth/auth.service';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { Button } from '../../../../shared/components/button/button';
import { DialogService } from '../../../../core/ui/dialog.service';
import { Loader } from '../../../../shared/components/loader/loader';

const THINKING_DELAY_MS = 1500;
const LOADING_MESSAGE_INTERVAL_MS = 2500;
const LOADING_MESSAGES = [
  'Mixing the pixels...',
  'Consulting the digital muse...',
  'Adding a dash of magic...',
  'Sharpening the details...',
  'Almost there...',
];

@Component({
  selector: 'app-create',
  imports: [LucideAngularModule, FormField, PageLayout, Button, Loader],
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

  private readonly creationRequest = signal<GenerateCreationDto>(
    this.creationService.getDefaultCreationRequest(),
  );
  protected readonly creationForm = form(this.creationRequest, (creationSchema) => {
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
  protected readonly isLoading = signal(false);
  protected readonly loadingMessage = signal(LOADING_MESSAGES[0]);
  private loadingMessageInterval?: ReturnType<typeof setInterval>;

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

  private startLoadingMessages() {
    let index = 0;
    this.loadingMessage.set(LOADING_MESSAGES[0]);
    this.loadingMessageInterval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      this.loadingMessage.set(LOADING_MESSAGES[index]);
    }, LOADING_MESSAGE_INTERVAL_MS);
  }

  private stopLoadingMessages() {
    clearInterval(this.loadingMessageInterval);
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
    this.creationRequest.update((request) => ({
      ...request,
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
    this.isLoading.set(true);
    this.startLoadingMessages();
    this.isThinking.set(true);
    this.displayedText.set('');

    try {
      const creation = await this.creationService.generateCreation(this.creationRequest());
      this.resetForm();
      this.say(`I named it "${creation.title}" for you. Take a look!`, () => {
        this.dialogService.openCreationResult(creation);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong while generating your image.';
      this.currentStep.set('prompt');
      this.say(message);
    } finally {
      this.stopLoadingMessages();
      this.isThinking.set(false);
      this.isLoading.set(false);
    }
  }

  private resetForm() {
    this.creationForm().reset();
    this.creationRequest.set(this.creationService.getDefaultCreationRequest());
  }
}
