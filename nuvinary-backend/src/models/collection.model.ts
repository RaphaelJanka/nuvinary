export interface CollectionCreation {
  id: string;
  url: string;
}

export interface CollectionTitleDto {
  title: string;
}

export interface AddCreationToCollectionDto {
  creationId: string;
}

export interface CollectionItem {
  PK: string;
  SK: string;
  id: string;
  createdBy: string;
  title: string;
  createdAt: string;
  creationIds: string[];
}

export interface CollectionResponse {
  id: string;
  createdBy: string;
  title: string;
  createdAt: string;
  creations: CollectionCreation[];
}
