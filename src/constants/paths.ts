import path from 'path';
import os from 'os';

export const CONFIG_FILE_PATH = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/files/config.json') : path.resolve('./config.json');

export const GAME_SETTINGS_FILE_PATH = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/files/settings.json') : path.resolve('./settings.json');

export const GAME_DIR = process.env.NODE_ENV === 'development'
  ? 'D:\\Oblivion'
  : path.resolve('../');

export const DOCUMENTS_DIR = path.resolve(os.homedir(), 'Documents');

export const BACKUP_DIR = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/backup')
  : path.resolve('./backup');

export const BACKUP_DIR_GAME_SETTINGS_FILES = process.env.NODE_ENV === 'development'
  ? path.resolve('./backup/game_settings_files')
  : path.resolve('./app/backup/game_settings_files');

