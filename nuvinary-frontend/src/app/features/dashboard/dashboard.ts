import { Component, inject } from '@angular/core';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar-service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Sidebar, RouterOutlet],
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
