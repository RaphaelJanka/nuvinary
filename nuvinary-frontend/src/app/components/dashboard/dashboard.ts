import { Component, inject } from '@angular/core';
import { MainHeader } from './main-header/main-header';
import { Sidebar } from './sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar-service';
import { AuthService } from '../../auth/services/auth-service';

@Component({
  selector: 'app-dashboard',
  imports: [MainHeader, Sidebar, RouterOutlet],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  authError = this.authService.authError;

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
