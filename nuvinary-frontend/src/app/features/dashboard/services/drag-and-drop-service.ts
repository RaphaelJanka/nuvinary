import { Injectable, signal } from '@angular/core';
import { Creation } from '../../../shared/models/creation.model';

@Injectable({ providedIn: 'root' })
export class DragAndDropService {
  private readonly _activeCreation = signal<Creation | null>(null);
  readonly activeCreation = this._activeCreation.asReadonly();

  private readonly _isDragging = signal<boolean>(false);
  readonly isDragging = this._isDragging.asReadonly();

  private readonly _dragOverId = signal<string | null>(null);
  readonly dragOverId = this._dragOverId.asReadonly();

  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  startDrag(creation: Creation) {
    this._activeCreation.set(creation);
    this._isDragging.set(true);
  }

  notifyDragOver(id: string, onExpand: (id: string) => void) {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    this._dragOverId.set(id);
    onExpand(id);
  }

  notifyDragLeave() {
    if (this.leaveTimer) clearTimeout(this.leaveTimer);

    this.leaveTimer = setTimeout(() => {
      this._dragOverId.set(null);
      this.leaveTimer = null;
    }, 300);
  }

  stopDrag() {
    this._activeCreation.set(null);
    this._isDragging.set(false);
    this._dragOverId.set(null);
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
  }
}
