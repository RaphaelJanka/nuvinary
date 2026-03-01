import { Component, inject } from '@angular/core';
import { SidebarService } from '../services/sidebar-service';
import { LucideAngularModule, Menu } from 'lucide-angular';

@Component({
  selector: 'app-main-header',
  imports: [LucideAngularModule],
  templateUrl: './main-header.html',
})
export class MainHeader {
  private sidebarService = inject(SidebarService);
  readonly menuIcon = Menu;

  isCollapsed = this.sidebarService.isCollapsed;

  onToggleSidebar() {
    this.sidebarService.toggle();
  }
}
