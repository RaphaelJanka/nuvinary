export interface Creation {
  id: string;
  title: string;
  url: string;
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
}
