import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';
import { SidebarService } from '../../../services/sidebar-service';

import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, NgTemplateOutlet],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'transition-all duration-300 ease-in-out bg-surface hidden lg:block',
  },
})
export class Sidebar {
  private readonly sideBarService = inject(SidebarService);
  protected readonly isCollapsed = this.sideBarService.isCollapsed;
  protected readonly showSettings = this.sideBarService.showSettings;
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly legalNavItems = this.sideBarService.legalNavItems;
  protected readonly dashboardNavItems = this.sideBarService.dashboardNavItems;
  protected readonly settingsNavItems = this.sideBarService.settingsNavItems;
}
