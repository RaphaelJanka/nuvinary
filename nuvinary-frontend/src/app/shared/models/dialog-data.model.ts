export type ConfirmType = 'delete' | 'warning' | 'info';

export interface ConfirmDialogData {
  title: string;
  message: string;
  type: ConfirmType;
}
