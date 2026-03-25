import { Creation } from '../../../../shared/models/creation.model';

export interface Collection {
  id: string;
  createdBy: string;
  name: string;
  createdAt: Date;
  creations: Creation[];
}
