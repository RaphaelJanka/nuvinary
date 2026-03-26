import { Injectable, signal } from '@angular/core';
import { Creation } from '../../../shared/models/creation.model';

@Injectable({ providedIn: 'root' })
export class DragService {
  private readonly _activeCreation = signal<Creation | null>(null);

  readonly activeCreation = this._activeCreation.asReadonly();

  private readonly _isDragging = signal<boolean>(false);
  readonly isDragging = this._isDragging.asReadonly();

  startDrag(creation: Creation) {
    this._activeCreation.set(creation);
    this._isDragging.set(true);
  }

  stopDrag() {
    this._activeCreation.set(null);
    this._isDragging.set(false);
  }
}
