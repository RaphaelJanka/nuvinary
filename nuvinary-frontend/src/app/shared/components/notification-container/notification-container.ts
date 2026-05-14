import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification-service';
import { CircleAlert, CircleCheck, Info, LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-notification-container',
  imports: [LucideAngularModule],
  template: `
    <div
      class="fixed right-8 bottom-8 z-9999 flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    >
      @for (note of notifications(); track note.id) {
        <div [class]="getClasses(note.type)">
          <lucide-icon
            [img]="icons[note.type]"
            class="w-5 h-5"
            [class.text-blue-500]="note.type === 'info'"
            [class.text-success]="note.type === 'success'"
            [class.text-danger]="note.type === 'error'"
          ></lucide-icon>

          <p class="flex-1 font-semibold text-sm tracking-tight">
            {{ note.message }}
          </p>

          <button
            (click)="onRemove(note.id)"
            class="p-1 rounded-lg text-text-gentle transition-colors hover:bg-black/5 hover:text-text-emphasis"
          >
            <lucide-icon [img]="icons.close" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationContainer {
  private readonly notificationService = inject(NotificationService);
  protected readonly notifications = this.notificationService.notifications;
  protected readonly icons = {
    success: CircleCheck,
    error: CircleAlert,
    info: Info,
    close: X,
  };

  protected getClasses(type: Notification['type']) {
    const base =
      'pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-md animate-in slide-in-from-right-10 duration-300';
    const styles = {
      success: 'bg-bg-success border-success-light text-success-strong',
      error: 'bg-bg-danger border-danger-light text-danger-strong',
      info: 'bg-white-strong border-border-gentle text-text-strong', // Dein neuer edler Default
    };
    return `${base} ${styles[type]}`;
  }

  protected onRemove(id: number) {
    this.notificationService.remove(id);
  }
}
