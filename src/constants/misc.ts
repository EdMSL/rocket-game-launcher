export const appProcess = 'app';
export const developerProcess = 'developer';
export const userThemeStyleFile = 'styles.css';

export enum Scope {
  MAIN = 'main',
  RENDERER = 'renderer',
}

export enum AppWindowName {
  MAIN = 'Main Window',
  DEV = 'Developer Window',
}

export enum AppWindowStateAction {
  MINIMIZE_WINDOW = 'minimize',
  MAXIMIZE_WINDOW = 'maximize',
  UNMAXIMIZE_WINDOW = 'unmaximize',
}

export enum Encoding {
  UTF8 = 'utf-8',
  WIN1251 = 'win1251',
  CP866 = 'cp866',
}

export enum GameSettingsFileView {
  SECTIONAL = 'sectional',
  TAG = 'tag',
  LINE = 'oblivion script',
}

export enum UIControllerType {
  CHECKBOX = 'checkbox',
  RANGE = 'range',
  SELECT = 'select',
  SWITCHER = 'switcher',
}

export enum HTMLInputType {
  CHECKBOX = 'checkbox',
  RANGE = 'range',
  SELECT = 'select-one',
  SWITCHER = 'checkbox',
  NUMBER = 'number',
}

export enum GameSettingsOptionType {
  DEFAULT = 'default',
  GROUP = 'group',
  RELATED = 'related',
  COMBINED = 'combined',
}

export enum RangeButtonName {
  DECREASE = 'decrease',
  INCREASE = 'increase',
}

export enum PathVariableName {
  GAME_DIR = '%GAME_DIR%',
  DOCUMENTS = '%DOCUMENTS%',
  DOCS_GAME = '%DOCS_GAME%',
  MO_DIR = '%MO_DIR%',
  MO_INI = '%MO_INI%',
  MO_MODS = '%MO_MODS%',
  MO_PROFILE = '%MO_PROFILE%',
}

export const gameSettingsFileAvailableVariablesBase = [
  PathVariableName.GAME_DIR,
  PathVariableName.DOCS_GAME,
];

export const gameSettingsFileAvailableVariablesMO = [
  PathVariableName.MO_PROFILE,
  PathVariableName.MO_MODS,
  PathVariableName.MO_DIR,
];

export const gameSettingsFileAvailableVariablesAll = [
  ...gameSettingsFileAvailableVariablesBase,
  ...gameSettingsFileAvailableVariablesMO,
];

export const pathVariablesCheckOrderArr = [
  PathVariableName.MO_PROFILE,
  PathVariableName.MO_MODS,
  PathVariableName.MO_DIR,
  PathVariableName.DOCS_GAME,
  PathVariableName.DOCUMENTS,
  PathVariableName.GAME_DIR,
];

export const PathRegExp = {
  GAME_DIR: new RegExp('^%GAME_DIR%'),
  DOCUMENTS: new RegExp('^%DOCUMENTS%'),
  DOCS_GAME: new RegExp('^%DOCS_GAME%'),
  MO: new RegExp(/^%MO.+%/),
  MO_DIR: new RegExp('^%MO_DIR%'),
  MO_MODS: new RegExp('^%MO_MODS%'),
  MO_PROFILE: new RegExp('^%MO_PROFILE%'),
  CUSTOM_BTNS_AVAILABLE_PATH_VARIABLES: new RegExp('^%(GAME_DIR|DOCS_GAME)%'),
  GAME_PARAMETERS_AVAILABLE_PATH_VARIABLES: new RegExp('^%(GAME_DIR|DOCS_GAME|MO_PROFILE|MO_MODS|MO_DIR)%'), //eslint-disable-line max-len
  PATH_VARIABLE: /^%[A-Z_]+%/,
  PATH_EXTNAME: /\.[a-zA-Z0-9]{2,}$/,
  CORRECT_PATH_WITH_VARIABLE_TO_FILE: /^%[A-Z_]+%\\(?:[a-zA-Z0-9]+\\)*([a-zA-Z0-9]+\.[a-zA-Z0-9]{3})/, //eslint-disable-line max-len
  CORRECT_PATH_WITH_VARIABLE_TO_FOLDER: /^%[A-Z_]+%(\\(?:[a-zA-Z0-9]+\\)*([a-zA-Z0-9]+)\\?(?!\.[a-zA-Z0-9]{3}))?/, //eslint-disable-line max-len
};

export enum LauncherButtonAction {
  RUN = 'run',
  OPEN = 'open',
}

export const FileExtension = {
  EXECUTABLE: ['exe', 'lnk'],
  INI: ['ini'],
};

export enum AppChannel {
  CHANGE_WINDOW_SIZE_STATE = 'change window state',
  SAVE_DEV_CONFIG = 'save developer config',
  CLOSE_APP = 'close app',
  GET_PATH_BY_PATH_SELECTOR = 'get path from native window',
  GET_APP_STATE = 'get app state',
  APP_STORE_UPDATED = 'app store updated',
  CHANGE_DEV_WINDOW_STATE = 'change dev window state',
  GET_MESSAGE_BOX_RESPONSE = 'get message box response',
  ERROR_HANDLER_CHANNEL = 'handle unhandled error',
}

export const modOrganizerGeneralSection = 'General';
export const modOrganizerProfileParam = 'selected_profile';
export const modOrganizerVersionParam = 'version';

export const availableOptionSeparators = ['!', '#', ':', '-', '+', '|'];
