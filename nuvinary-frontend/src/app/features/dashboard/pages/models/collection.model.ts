import { Creation } from '../../../../shared/models/creation.model';

export interface Collection {
  id: string;
  createdBy: string;
  title: string;
  createdAt: Date;
  creations: Creation[];
}
