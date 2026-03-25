import { Collection } from '../../features/dashboard/pages/models/collection.model';

export const mockCollections: Collection[] = [
  {
    id: '1',
    title: 'Vacation',
    createdAt: new Date(),
    createdBy: '101',
    creations: [
      {
        id: '4',
        title: 'Abstract Fluidity',
        url: 'https://picsum.photos/seed/abstract/800/1000',
        createdAt: new Date('2026-03-07T09:15:00'),
        dimensions: { width: 1024, height: 1024 },
        progress: 100,
        fileSize: 2100000,
        isPublic: true,
        status: 'completed',
        createdBy: { id: '101', name: 'Test User', avatarUrl: 'https://i.pravatar.cc/150?u=101' },
        aiMetadata: {
          model: 'stability.sdxl-v1',
          prompt: 'Swirling liquid gold and silk, abstract 3d render, soft studio lighting',
          steps: 40,
          cfgScale: 12.0,
        },
      },
    ],
  },
  { id: '2', title: 'Work', createdAt: new Date(), createdBy: '101', creations: [] },
  {
    id: '3',
    title: 'Inspiration',
    createdAt: new Date(),
    createdBy: '101',
    creations: [
      {
        id: '1',
        title: 'Cyberpunk Forest',
        url: 'https://picsum.photos/seed/forest/800/1000',
        createdAt: new Date('2026-03-01T10:00:00'),
        dimensions: { width: 1024, height: 1024 },
        progress: 100,
        fileSize: 1450000,
        isPublic: true,
        status: 'completed',
        createdBy: { id: '101', name: 'Test User', avatarUrl: 'https://i.pravatar.cc/150?u=101' },
        aiMetadata: {
          model: 'amazon.titan-image-generator-v1',
          prompt: 'A dense forest with neon purple glowing mushrooms, cinematic lighting, 8k',
          steps: 50,
          cfgScale: 7.5,
        },
      },
    ],
  },
];
