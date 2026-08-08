import { Creation } from '../../shared/models/creation.model';

export interface GenerateCreationDto {
  prompt: string;
  title: string;
}

export interface GenerateCreationResponse extends Creation {
  remainingCredits: number;
}
