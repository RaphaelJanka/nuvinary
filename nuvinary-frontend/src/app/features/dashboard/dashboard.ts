import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Header } from './layout/dashboard-header/dashboard-header';
import { Sidebar } from './layout/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from '../services/sidebar-service';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Sidebar, RouterOutlet],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly sidebarService = inject(SidebarService);
  protected readonly isCollapsed = this.sidebarService.isCollapsed;
}
