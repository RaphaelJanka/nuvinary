import { Component, ElementRef, HostListener, inject, output } from '@angular/core';
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
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly elementRef = inject(ElementRef);
  protected readonly authUser = this.authService.authUser;
  protected readonly logOutIcon = LogOut;

  readonly closeMenu = output<void>();

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  protected onGlobalClick(event: MouseEvent | TouchEvent): void {
    const clickedInsiide = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInsiide) {
      this.closeMenu.emit();
    }
  }

  protected readonly menuItems: MenuItem[] = [
    { label: 'Profile Settings', icon: CircleUserRound, route: '/dashboard/settings/profile' },
    { label: 'Account Overview', icon: ChartLine, route: '/dashboard/settings/overview' },
    { label: 'Security & Password', icon: LockOpen, route: '/dashboard/settings/security' },
    { label: 'Preferences', icon: Settings, route: '/dashboard/settings/preferences' },
  ];

  protected handleAction(item: MenuItem): void {
    if (item.route) {
      this.router.navigate([item.route]);
    }
    this.closeMenu.emit();
  }

  protected onLogOut(): void {
    this.authService.logOut();
    this.router.navigate(['/login']);
  }
}
