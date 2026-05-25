import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Signal,
} from '@angular/core';
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
import { CreationService } from '../../../features/services/creation-service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { FormInput } from '../form-input/form-input';
import { form, maxLength, required } from '@angular/forms/signals';
import { SidebarService } from '../../../features/services/sidebar-service';

@Component({
  selector: 'app-creation-details',
  imports: [CommonModule, LucideAngularModule, FormInput],
  templateUrl: './creation-details.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreationDetails {
  private readonly creationService = inject(CreationService);
  private readonly authService = inject(AuthService);
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  private readonly dialogRef = inject(DialogRef);

  protected readonly currentUser = this.authService.authUser;
  protected readonly creation = inject<Signal<Creation>>(DIALOG_DATA);
  protected isMobile = this.sidebarService.isMobile;
  protected isEditingTitle = signal(false);
  protected editValue = signal('');
  private readonly titleModel = signal({
    title: this.creation().title,
  });
  protected readonly editTitleForm = form(this.titleModel, (schema) => {
    required(schema.title, { message: 'Title is required' });
    maxLength(schema.title, 40);
  });

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
