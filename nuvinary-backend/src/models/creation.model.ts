export interface GenerateCreationDto {
  title: string;
  prompt: string;
}

export interface CreationItem {
  PK: string;
  SK: string;
  id: string;
  title: string;
  imageKey: string;
  createdAt: string;
  isPublic: boolean;
  createdBy: {
    id: string;
    displayName: string;
    avatarColor: string;
  };
  aiMetadata: {
    model: string;
    prompt: string;
  };
  GSI1PK?: string;
  GSI1SK?: string;
}

export interface CreationResponse {
  id: string;
  title: string;
  url: string;
  createdAt: string;
  isPublic: boolean;
  createdBy: CreationItem['createdBy'];
  aiMetadata: CreationItem['aiMetadata'];
}

export interface GenerateCreationResponse extends CreationResponse {
  remainingCredits: number;
}
