import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Calendar,
  Cpu,
  Droplet,
  Globe,
  Layers,
  Lock,
  LucideAngularModule,
  Maximize,
  Pen,
  Trash,
  X,
} from 'lucide-angular';

@Component({
  selector: 'app-creation-details',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './creation-details.html',
})
export class CreationDetails {
  protected readonly creation = inject(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef);
  protected readonly layersIcon = Layers;
  protected readonly cpuIcon = Cpu;
  protected readonly lockIcon = Lock;
  protected readonly globeIcon = Globe;
  protected readonly trashIcon = Trash;
  protected readonly editIcon = Pen;
  protected readonly closeIcon = X;
  protected readonly maximizeIcon = Maximize;
  protected readonly dateIcon = Calendar;
  protected readonly dropdownIcon = Droplet;
  isDropdownOpen = false;

  onClose() {
    this.dialogRef.close();
  }
}
