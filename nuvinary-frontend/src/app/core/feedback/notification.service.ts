import { Injectable, signal } from '@angular/core';
import { Notification } from './notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notifications = signal<Notification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  show(message: string, type: Notification['type'] = 'info') {
    const id = Date.now();
    const newNote: Notification = { id, message, type };

    this._notifications.update((prev) => [...prev, newNote]);

    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this._notifications.update((prev) => prev.filter((n) => n.id !== id));
  }
}
