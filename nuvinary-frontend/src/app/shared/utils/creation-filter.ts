import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { Creation } from '../models/creation.model';

export function createCreationFilter(sourceList: Signal<Creation[]>): {
  searchQuery: WritableSignal<string>;
  filteredCreations: Signal<Creation[]>;
} {
  const searchQuery = signal('');

  const filteredCreations = computed(() => {
    const query = searchQuery().toLowerCase().trim();
    const list = sourceList();

    if (!query) return list;

    return list.filter(
      (c) =>
        c.title.toLowerCase().includes(query) || c.aiMetadata.prompt.toLowerCase().includes(query),
    );
  });

  return { searchQuery, filteredCreations };
}
