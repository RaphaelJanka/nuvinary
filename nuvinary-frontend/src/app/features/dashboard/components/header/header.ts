import { Component, computed, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar-service';
import { LucideAngularModule, Menu } from 'lucide-angular';

import { UserMenu } from './user-menu/user-menu';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-main-header',
  imports: [LucideAngularModule, UserMenu],
  templateUrl: './header.html',
})
export class Header {
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  protected readonly isCollapsed = this.sidebarService.isCollapsed;
  protected readonly authUser = this.authService.authUser;
  protected isMenuOpen = false;
  protected readonly menuIcon = Menu;
  protected readonly userInitials = computed<string>(() => {
    const user = this.authUser();
    if (!user?.firstName || !user.lastName) return '';
    return user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
  });

  protected onToggleSidebar() {
    this.sidebarService.toggle();
  }

  protected onToggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
