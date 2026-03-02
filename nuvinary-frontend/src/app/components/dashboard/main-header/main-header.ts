import { Component, computed, inject } from '@angular/core';
import { SidebarService } from '../services/sidebar-service';
import {
  ChartLine,
  CircleUserRound,
  LockOpen,
  LogOut,
  LucideAngularModule,
  Menu,
  Settings,
} from 'lucide-angular';
import { AuthService } from '../../../auth/services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-header',
  imports: [LucideAngularModule],
  templateUrl: './main-header.html',
})
export class MainHeader {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  private router = inject(Router);
  readonly menuIcon = Menu;
  readonly circleUserRoundIcon = CircleUserRound;
  readonly logOutIcon = LogOut;
  readonly settingsIcon = Settings;
  readonly lockOpenIcon = LockOpen;
  readonly chartLineIcon = ChartLine;

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

  onLogOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
