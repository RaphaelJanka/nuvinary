import { computed, signal } from '@angular/core';

export class ResendHandler {
  private resendTimer = signal(0);

  readonly canResend = computed(() => this.resendTimer() === 0);

  readonly resendButtonLabel = computed(() => {
    if (this.resendTimer() > 0) return `Resend in ${this.resendTimer()}s`;
    return 'Send Code';
  });

  reset() {
    this.resendTimer.set(0);
  }

  startTimer() {
    this.resendTimer.set(60);

    const tick = () => {
      if (this.resendTimer() <= 0) return;
      this.resendTimer.update((s) => s - 1);
      if (this.resendTimer() > 0) {
        setTimeout(tick, 1000);
      }
    };
    setTimeout(tick, 1000);
  }

  async execute(action: () => Promise<void>) {
    if (this.canResend()) {
      await action();
      this.startTimer();
    }
  }
}
