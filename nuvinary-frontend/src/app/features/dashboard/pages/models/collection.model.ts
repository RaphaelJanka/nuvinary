export interface CollectionCreation {
  id: string;
  url: string;
}

export interface Collection {
  id: string;
  createdBy: string;
  title: string;
  createdAt: string;
  creations: CollectionCreation[];
}
