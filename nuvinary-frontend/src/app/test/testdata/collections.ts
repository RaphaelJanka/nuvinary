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
        createdAt: '2026-03-07T09:15:00.000Z',
        isPublic: true,
        createdBy: { id: '101', displayName: 'Test User', avatarColor: '#7C3AED' },
        aiMetadata: {
          model: 'stability.stable-image-core-v1:1',
          prompt: 'Swirling liquid gold and silk, abstract 3d render, soft studio lighting',
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
        createdAt: '2026-03-01T10:00:00.000Z',
        isPublic: true,
        createdBy: { id: '101', displayName: 'Test User', avatarColor: '#7C3AED' },
        aiMetadata: {
          model: 'stability.stable-image-core-v1:1',
          prompt: 'A dense forest with neon purple glowing mushrooms, cinematic lighting, 8k',
        },
      },
    ],
  },
];
