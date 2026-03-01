import { Component, inject } from '@angular/core';
import { SidebarService } from '../services/sidebar-service';

@Component({
  selector: 'app-main-header',
  imports: [],
  templateUrl: './main-header.html',
})
export class MainHeader {
  private sidebarService = inject(SidebarService);

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
