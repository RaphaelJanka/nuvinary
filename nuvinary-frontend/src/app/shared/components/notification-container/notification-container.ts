import { Component, inject } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification-service';
import { CircleAlert, CircleCheck, Info, LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-notification-container',
  imports: [LucideAngularModule],
  template: `
    <div
      class="fixed bottom-8 right-8 z-9999 flex flex-col gap-3 pointer-events-none w-full max-w-sm"
    >
      @for (note of notifications(); track note.id) {
        <div [class]="getClasses(note.type)">
          <lucide-icon
            [img]="icons[note.type]"
            [class.text-blue-500]="note.type === 'info'"
            [class.text-green-500]="note.type === 'success'"
            [class.text-red-500]="note.type === 'error'"
            class="w-5 h-5"
          ></lucide-icon>

          <p class="text-sm font-semibold tracking-tight flex-1">
            {{ note.message }}
          </p>

          <button
            (click)="onRemove(note.id)"
            class="p-1 hover:bg-black/5 rounded-lg transition-colors text-zinc-400 hover:text-zinc-600"
          >
            <lucide-icon [img]="icons.close" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
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
      success: 'bg-green-50/90 border-green-100 text-green-900',
      error: 'bg-red-50/90 border-red-100 text-red-900',
      info: 'bg-white/90 border-zinc-200 text-zinc-800', // Dein neuer edler Default
    };
    return `${base} ${styles[type]}`;
  }

  protected onRemove(id: number) {
    this.notificationService.remove(id);
  }
}
