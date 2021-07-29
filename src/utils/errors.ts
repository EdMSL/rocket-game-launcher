import { dialog } from 'electron';

export const showErrorBox = (error: Error, title = 'There\'s been an error'): void => {
  dialog.showErrorBox(title, error.message);
};