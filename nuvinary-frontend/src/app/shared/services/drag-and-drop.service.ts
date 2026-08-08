import { Injectable, signal } from '@angular/core';
import { DraggableItem } from '../models/draggable-item.model';

@Injectable({ providedIn: 'root' })
export class DragAndDropService {
  private readonly _activeCreation = signal<DraggableItem | null>(null);
  readonly activeCreation = this._activeCreation.asReadonly();

  private readonly _isDragging = signal<boolean>(false);
  readonly isDragging = this._isDragging.asReadonly();

  private readonly _dragOverId = signal<string | null>(null);
  readonly dragOverId = this._dragOverId.asReadonly();

  private leaveTimer: ReturnType<typeof setTimeout> | null = null;

  /** Marks a creation as the one currently being dragged. */
  startDrag(creation: DraggableItem) {
    this._activeCreation.set(creation);
    this._isDragging.set(true);
  }

  /** Marks a collection as the current drop target and expands it via the callback. */
  notifyDragOver(id: string, onExpand: (id: string) => void) {
    if (this.leaveTimer) {
      clearTimeout(this.leaveTimer);
      this.leaveTimer = null;
    }
    this._dragOverId.set(id);
    onExpand(id);
  }

  /** Clears the drop target after a short delay, so briefly crossing into a child element doesn't flicker it off. */
  notifyDragLeave() {
    if (this.leaveTimer) clearTimeout(this.leaveTimer);

    this.leaveTimer = setTimeout(() => {
      this._dragOverId.set(null);
      this.leaveTimer = null;
    }, 300);
  }

  /** Resets all drag state once a drag ends, regardless of whether it was dropped. */
  stopDrag() {
    this._activeCreation.set(null);
    this._isDragging.set(false);
    this._dragOverId.set(null);
    if (this.leaveTimer) clearTimeout(this.leaveTimer);
  }
}
