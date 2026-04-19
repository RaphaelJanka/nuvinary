import { Component, inject, signal } from '@angular/core';
import { SidebarService } from '../../services/sidebar-service';
import { LucideAngularModule, Menu } from 'lucide-angular';

import { UserMenu } from './user-menu/user-menu';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserInitialPipe } from '../../../../shared/pipes/user-initial.pipe';

@Component({
  selector: 'app-main-header',
  imports: [LucideAngularModule, UserMenu, UserInitialPipe],
  templateUrl: './header.html',
})
export class Header {
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  protected readonly isCollapsed = this.sidebarService.isCollapsed;
  protected readonly authUser = this.authService.authUser;
  protected isMenuOpen = signal(false);
  protected readonly menuIcon = Menu;

  protected onToggleSidebar() {
    this.sidebarService.toggle();
  }

  protected onToggleMenu() {
    this.isMenuOpen.update((v) => !v);
  }
}
