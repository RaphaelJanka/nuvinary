import { Component, inject } from '@angular/core';
import { MainHeader } from './main-header/main-header';
import { Sidebar } from './sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar-service';

@Component({
  selector: 'app-app-shell',
  imports: [MainHeader, Sidebar, RouterOutlet],
  templateUrl: './app-shell.html',
})
export class AppShell {
  private sidebarService = inject(SidebarService);

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
