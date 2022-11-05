import path from 'path';

import { GAME_SETTINGS_CONFIG_FILE_NAME, LAUNCHER_CONFIG_FILE_NAME } from './defaultData';

export const GAME_SETTINGS_FILES_BACKUP_FOLDER_NAME = 'game_settings_files';

export const CONFIG_FILE_PATH = path.resolve(process.env.NODE_ENV === 'development'
  ? `./app/files/${LAUNCHER_CONFIG_FILE_NAME}`
  : `./${LAUNCHER_CONFIG_FILE_NAME}`);

export const ICON_PATH = path.resolve(process.env.NODE_ENV === 'development'
  ? './src/public/icon.ico'
  : './icon.ico');

export const GAME_SETTINGS_FILE_PATH = path.resolve(process.env.NODE_ENV === 'development'
  ? `./app/files/${GAME_SETTINGS_CONFIG_FILE_NAME}`
  : `./${GAME_SETTINGS_CONFIG_FILE_NAME}`);

export const GAME_DIR = process.env.NODE_ENV === 'development'
  ? path.resolve('./src/tests/fixtures/files')
  : path.resolve('../');

export const BACKUP_DIR = path.resolve(process.env.NODE_ENV === 'development'
  ? './app/backup'
  : './backup');

export const BACKUP_DIR_GAME_SETTINGS_FILES = path.resolve(`${BACKUP_DIR}/${GAME_SETTINGS_FILES_BACKUP_FOLDER_NAME}`); //eslint-disable-line max-len

export const USER_THEMES_DIR = path.resolve(process.env.NODE_ENV === 'development'
  ? './app/themes'
  : './themes');

export const DefaultMOPathVariables: IModOrganizerPathVariables = {
  '%MO_INI%': '',
  '%MO_DIR%': '',
  '%MO_MODS%': '',
  '%MO_PROFILE%': '',
};

export const DefaultPathVariable: IPathVariables = {
  '%GAME_DIR%': GAME_DIR,
  '%DOCUMENTS%': '',
  '%DOCS_GAME%': '',
  ...DefaultMOPathVariables,
};

export interface IModOrganizerPathVariables {
  '%MO_INI%': string,
  '%MO_DIR%': string,
  '%MO_MODS%': string,
  '%MO_PROFILE%': string,
}

export interface IPathVariables extends IModOrganizerPathVariables{
  '%GAME_DIR%': string,
  '%DOCUMENTS%': string,
  '%DOCS_GAME%': string,
}
