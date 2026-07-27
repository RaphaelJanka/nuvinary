export interface CollectionCreation {
  id: string;
  url: string;
}

export interface CreateCollectionDto {
  title: string;
}

export interface CollectionItem {
  PK: string;
  SK: string;
  id: string;
  createdBy: string;
  title: string;
  createdAt: string;
  creations: CollectionCreation[];
}

export interface CollectionResponse {
  id: string;
  createdBy: string;
  title: string;
  createdAt: string;
  creations: CollectionCreation[];
}
