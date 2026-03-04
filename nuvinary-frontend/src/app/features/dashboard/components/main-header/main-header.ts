import { Component, computed, inject } from '@angular/core';
import { SidebarService } from '../../services/sidebar-service';
import { LucideAngularModule, Menu } from 'lucide-angular';

import { UserMenu } from './user-menu/user-menu';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-main-header',
  imports: [LucideAngularModule, UserMenu],
  templateUrl: './main-header.html',
})
export class MainHeader {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  readonly menuIcon = Menu;

  authUser = this.authService.authUser;
  isMenuOpen = false;

  userInitials = computed(() => {
    const user = this.authUser();
    if (!user) return '';
    return user.firstName.charAt(0).toUpperCase() + user.lastName.charAt(0).toUpperCase();
  });

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
