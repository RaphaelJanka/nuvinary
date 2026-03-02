import { Component, inject } from '@angular/core';
import { MainHeader } from './main-header/main-header';
import { Sidebar } from './sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar-service';
import { AuthService } from '../../auth/services/auth-service';

@Component({
  selector: 'app-app-shell',
  imports: [MainHeader, Sidebar, RouterOutlet],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  authError = this.authService.authError;

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
