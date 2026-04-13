import { Component, model } from '@angular/core';
import { LucideAngularModule, Search, X } from 'lucide-angular';

@Component({
  selector: 'app-search-input',
  imports: [LucideAngularModule],
  templateUrl: './search-input.html',
})
export class SearchInput {
  query = model<string>('');
  protected readonly searchIcon = Search;
  protected readonly icons = {
    searchIcon: Search,
    closeIcon: X,
  };
}
