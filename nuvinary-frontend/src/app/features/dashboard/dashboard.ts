import { Component, inject } from '@angular/core';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from './services/sidebar-service';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly sidebarService = inject(SidebarService);
  protected readonly isCollapsed = this.sidebarService.isCollapsed;
}
