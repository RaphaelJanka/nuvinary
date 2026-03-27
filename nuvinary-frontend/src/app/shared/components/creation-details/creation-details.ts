import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, Signal } from '@angular/core';
import {
  Calendar,
  Check,
  Cpu,
  FileText,
  Globe,
  Layers,
  Lock,
  LucideAngularModule,
  Maximize,
  Pen,
  Trash,
  User,
  X,
} from 'lucide-angular';
import { Creation } from '../../models/creation.model';
import { CreationService } from '../../../features/dashboard/services/creation-service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-creation-details',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './creation-details.html',
})
export class CreationDetails {
  private readonly creationService = inject(CreationService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DialogRef);

  protected readonly currentUser = this.authService.authUser;
  protected readonly creation = inject<Signal<Creation>>(DIALOG_DATA);
  protected isEditingTitle = signal(false);
  protected editValue = signal('');
  protected readonly canEdit = computed(() => {
    return this.router.url.includes('/gallery');
  });
  protected readonly icons = {
    layersIcon: Layers,
    cpuIcon: Cpu,
    lockIcon: Lock,
    globeIcon: Globe,
    trashIcon: Trash,
    editIcon: Pen,
    closeIcon: X,
    maximizeIcon: Maximize,
    dateIcon: Calendar,
    userIcon: User,
    fileTextIcon: FileText,
    checkIcon: Check,
  };

  onStartEditTitle() {
    this.editValue.set(this.creation().title);
    this.isEditingTitle.set(true);
  }

  onSaveTitle() {
    const newTitle = this.editValue().trim();
    if (newTitle && newTitle !== this.creation().title) {
      this.creationService.updateTitle(this.creation().id, newTitle);
    }
    this.isEditingTitle.set(false);
  }

  onCancelEdit() {
    this.isEditingTitle.set(false);
  }

  onTogglePublic() {
    const currentId = this.creation().id;
    this.creationService.togglePublicStatus(currentId);
  }

  onClose() {
    this.dialogRef.close();
  }
}
