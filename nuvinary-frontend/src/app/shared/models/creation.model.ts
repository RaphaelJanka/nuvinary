export type CreationStatus = 'generating' | 'completed' | 'failed' | 'canceled';

export interface Creation {
  id: string;
  title: string;
  url: string;
  createdAt: Date;

  dimensions: { width: number; height: number };
  progress: number;
  fileSize: number;
  isPublic: boolean;
  status: CreationStatus;

  createdBy: {
    id: string;
    name: string;
    avatarUrl: string;
  };

  aiMetadata: {
    model: string;
    prompt: string;
    steps: number;
    cfgScale: number;
  };
}
