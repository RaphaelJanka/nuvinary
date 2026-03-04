import { Component, inject, output } from '@angular/core';
import {
  ChartLine,
  CircleUserRound,
  LockOpen,
  LogOut,
  LucideAngularModule,
  Settings,
} from 'lucide-angular';
import { AuthService } from '../../../../auth/services/auth-service';
import { Router } from '@angular/router';
import { LucideIconData } from 'lucide-angular/src/icons';

interface MenuItem {
  label: string;
  icon: LucideIconData;
  route: string;
}

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.html',
  imports: [LucideAngularModule],
})
export class UserMenu {
  private authService = inject(AuthService);
  private router = inject(Router);
  authUser = this.authService.authUser;
  readonly logOutIcon = LogOut;

  closeMenu = output<void>();

  menuItems: MenuItem[] = [
    { label: 'Profile Settings', icon: CircleUserRound, route: '/dashboard/settings/profile' },
    { label: 'Account Overview', icon: ChartLine, route: '/dashboard/settings/overview' },
    { label: 'Security & Password', icon: LockOpen, route: '/dashboard/settings/security' },
    { label: 'Preferences', icon: Settings, route: '/dashboard/settings/preferences' },
  ];

  handleAction(item: MenuItem) {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    this.closeMenu.emit();
  }

  onLogOut() {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
