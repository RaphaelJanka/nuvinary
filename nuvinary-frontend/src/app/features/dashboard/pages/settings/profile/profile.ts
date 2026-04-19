import { Component, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../../shared/components/page-layout/page-layout';
import { AuthService } from '../../../../../core/auth/auth.service';
import { Check, Lock, LucideAngularModule } from 'lucide-angular';
import { UserInitialPipe } from '../../../../../shared/pipes/user-initial.pipe';

@Component({
  selector: 'app-profile',
  imports: [PageLayout, LucideAngularModule, UserInitialPipe],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly authService = inject(AuthService);
  protected readonly user = this.authService.authUser;
  protected readonly avatarColors = this.authService.avatarColors;
  protected readonly selectedAvatarColor = signal(this.user()?.avatarConfig?.value);
  protected readonly icons = {
    checkIcon: Check,
    lockIcon: Lock,
  };

  onColorSelect(color: string) {
    this.selectedAvatarColor.set(color);
  }
}
