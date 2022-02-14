import path from 'path';

export const GAME_SETTINGS_FILES_BACKUP_FOLDER_NAME = 'game_settings_files';

export const CONFIG_FILE_PATH = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/files/config.json') : path.resolve('./config.json');

export const GAME_SETTINGS_FILE_PATH = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/files/settings.json') : path.resolve('./settings.json');

export const GAME_DIR = process.env.NODE_ENV === 'development'
  ? 'D:\\Oblivion'
  : path.resolve('../');

export const BACKUP_DIR = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/backup')
  : path.resolve('./backup');

export const BACKUP_DIR_GAME_SETTINGS_FILES = path.resolve(`${BACKUP_DIR}/${GAME_SETTINGS_FILES_BACKUP_FOLDER_NAME}`); //eslint-disable-line max-len

export const USER_THEMES_DIR = process.env.NODE_ENV === 'development'
  ? path.resolve('./app/themes')
  : path.resolve('./themes');

export const DefaultCustomPath: IDefaultCustomPaths = {
  '%GAME_DIR%': GAME_DIR,
  '%DOCUMENTS%': '',
};

export interface IDefaultCustomPaths {
  '%GAME_DIR%': string,
  '%DOCUMENTS%': string,
  //@ts-ignore
  '%MO_DIR%'?: string|undefined,
  //@ts-ignore
  '%MO_MODS%'?: string|undefined,
  //@ts-ignore
  '%MO_PROFILE%'?: string|undefined,
}

export interface ICustomPaths {
  [label: string]: string,
}

export type ITotalCustomPaths = IDefaultCustomPaths & ICustomPaths;
