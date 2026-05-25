import { Component, inject } from '@angular/core';
import { LucideAngularModule, LucideIconData, X } from 'lucide-angular';
import { SidebarService } from '../../../services/sidebar-service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-mobile-sidebar',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './mobile-sidebar.html',
})
export class MobileSidebar {
  private readonly sidebarService = inject(SidebarService);
  protected readonly isOpen = this.sidebarService.isMobileSidebarOpen;
  protected readonly dashboardNavItems = this.sidebarService.dashboardNavItems;
  protected readonly legalNavItems = this.sidebarService.legalNavItems;
  protected readonly closeIcon: LucideIconData = X;

  onClose() {
    this.sidebarService.toggle();
  }
}
