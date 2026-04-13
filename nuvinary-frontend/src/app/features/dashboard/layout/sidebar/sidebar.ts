import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  ArrowLeft,
  BookImage,
  ChartLine,
  CircleUserRound,
  Earth,
  LockOpen,
  LucideAngularModule,
  PencilRuler,
  Settings,
  Sparkles,
} from 'lucide-angular';
import { SidebarService } from '../../services/sidebar-service';

import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule, NgTemplateOutlet],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly sideBarService = inject(SidebarService);
  protected readonly isCollapsed = this.sideBarService.isCollapsed;
  protected readonly showSettings = this.sideBarService.showSettings;
  protected readonly arrowLeftIcon = ArrowLeft;

  protected readonly sideBarMenuItems = [
    { label: 'My Gallery', icon: BookImage, route: '/dashboard/gallery' },
    { label: 'Create', icon: PencilRuler, route: '/dashboard/create' },
    { label: 'My Visionboard', icon: Sparkles, route: '/dashboard/visionboard' },
    { label: 'Community', icon: Earth, route: '/dashboard/community' },
  ];

  protected readonly settingsMenuItems = [
    { label: 'Profile Settings', icon: CircleUserRound, route: '/dashboard/settings/profile' },
    { label: 'Account Overview', icon: ChartLine, route: '/dashboard/settings/overview' },
    { label: 'Security', icon: LockOpen, route: '/dashboard/settings/security' },
    { label: 'Preferences', icon: Settings, route: '/dashboard/settings/preferences' },
  ];

  protected readonly supportMenuItems = [
    { label: 'Privacy Policy', route: '/dashboard/' },
    { label: 'Terms of Service', route: '/dashboard/' },
    { label: 'Contact Support', route: '/dashboard/' },
  ];
}
