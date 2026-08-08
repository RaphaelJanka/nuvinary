import { LucideIconData } from 'lucide-angular';

export interface NavItem {
  label: string;
  icon?: LucideIconData;
  route: string;
  tooltip?: string;
}
