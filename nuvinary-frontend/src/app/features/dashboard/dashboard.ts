import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Header } from './layout/dashboard-header/dashboard-header';
import { Sidebar } from './layout/sidebar/sidebar';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from '../services/sidebar-service';
import { MobileSidebar } from './layout/mobile-sidebar/mobile-sidebar';
import { ScreenSizeService } from '../../shared/services/screen-size-service';

@Component({
  selector: 'app-dashboard',
  imports: [Header, Sidebar, RouterOutlet, MobileSidebar],
  templateUrl: './dashboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-1 flex-col',
  },
})
export class Dashboard {
  private readonly sidebarService = inject(SidebarService);
  private readonly screenSizeService = inject(ScreenSizeService);
  protected readonly isCollapsed = this.sidebarService.isCollapsed;
  protected isMobile = this.screenSizeService.isMobile;
}
