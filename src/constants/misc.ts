export const Scope = {
  MAIN: 'main',
  RENDERER: 'renderer',
};

export const Encoding = {
  UTF8: 'utf-8',
  WIN1251: 'win1251',
  CP866: 'cp866',
};

export const GameSettingsFileView = {
  SECTIONAL: 'sectional',
  LINE: 'line',
  TAG: 'tag',
};

export const GameSettingParameterControllerType = {
  CHECKBOX: 'checkbox',
  RANGE: 'range',
  SELECT: 'select',
  SWITCHER: 'switcher',
};

export const HTMLInputType = {
  CHECKBOX: 'checkbox',
  RANGE: 'range',
  SELECT: 'select-one',
  SWITCHER: 'checkbox',
};

export const GameSettingsOptionType = {
  DEFAULT: 'default',
  GROUP: 'group',
  RELATED: 'related',
  COMBINED: 'combined',
};

export const RangeButtonName = {
  DECREASE: 'decrease',
  INCREASE: 'increase',
};

export const PathVariableName = {
  GAME_DIR: '%GAME_DIR%',
  DOCUMENTS: '%DOCUMENTS%',
  DOCS_GAME: '%DOCS_GAME%',
  MO_DIR: '%MO_DIR%',
  MO_INI: '%MO_INI%',
  MO_MODS: '%MO_MODS%',
  MO_PROFILE: '%MO_PROFILE%',
};

export const pathVariablesCheckOrderArr = [
  PathVariableName.MO_PROFILE,
  PathVariableName.MO_MODS,
  PathVariableName.MO_DIR,
  PathVariableName.DOCS_GAME,
  PathVariableName.DOCUMENTS,
  PathVariableName.GAME_DIR,
];

export const PathRegExp = {
  GAME_DIR_REGEXP: new RegExp('^%GAME_DIR%'),
  DOCUMENTS_REGEXP: new RegExp('^%DOCUMENTS%'),
  DOCS_GAME_REGEXP: new RegExp('^%DOCS_GAME%'),
  MO_DIR_REGEXP: new RegExp('^%MO_DIR%'),
  MO_INI_REGEXP: new RegExp('^%MO_INI%'),
  MO_MODS_REGEXP: new RegExp('^%MO_MODS%'),
  MO_PROFILE_REGEXP: new RegExp('^%MO_PROFILE%'),
  PATH_VARIABLE_NAME_REGEXP: /^%[A-Z_]+%$/,
  PATH_VARIABLE_REGEXP: /^%[A-Z_]+%/,
  CORRECT_PATH_WITH_VARIABLE_TO_FILE_REGEXP: /^%[A-Z_]+%\\(?:[a-zA-Z0-9]+\\)*([a-zA-Z0-9]+\.[a-z0-9]{3})/,
  CORRECT_PATH_WITH_VARIABLE_TO_FOLDER_REGEXP: /^%[A-Z_]+%\\((?:[a-zA-Z0-9]+\\)*([a-zA-Z0-9]+)\\?)?/,
};

export const LauncherButtonAction = {
  RUN: 'run',
  OPEN: 'open',
};

export const FileExtension = {
  EXECUTABLE: ['exe', 'lnk'],
  INI: ['ini'],
};

export const AppChannel = {
  OPEN_DEV_WINDOW: 'open dev window',
  CLOSE_DEV_WINDOW: 'close dev window',
  DEV_WINDOW_OPENED: 'dev window opened',
  DEV_WINDOW_CLOSED: 'dev window closed',
  MINIMIZE_WINDOW: 'minimize window',
  CHANGE_WINDOW_SETTINGS: 'change window settings',
  MAX_UNMAX_WINDOW: 'max-unmax window',
  WINDOW_RESIZED: 'window resized',
  CLOSE_APP: 'close app',
  GET_PATH_BY_PATH_SELECTOR: 'get path from native window',
};

export const AppWindowName = {
  MAIN: 'Main Window',
  DEV: 'Developer Window',
};

export interface IWindowField {
  id: string,
  label: string,
  description: string,
}

export const appWindowFields: IWindowField[] = [{
  id: 'width',
  label: 'Ширина по умолчанию',
  description: 'Ширина окна приложения по умолчанию. Является постоянной, если размеры окна установлены как неизменяемые, и начальной, если размеры окна изменяемые' //eslint-disable-line
},
{
  id: 'height',
  label: 'Высота по умолчанию',
  description: 'Высота окна приложения по умолчанию. Является постоянной, если размеры окна установлены как неизменяемые, и начальной, если размеры окна изменяемые' //eslint-disable-line
},
{
  id: 'minWidth',
  label: 'Минимальная ширина',
  description: 'Минимальная ширина окна приложения, до которой пользователь может уменьшить размер окна' //eslint-disable-line
},
{
  id: 'minHeight',
  label: 'Минимальная высота',
  description: 'Минимальная высота окна приложения, до которой пользователь может уменьшить размер окна' //eslint-disable-line
},
{
  id: 'maxWidth',
  label: 'Максимальная ширина',
  description: 'Максимальная ширина окна приложения, до которой пользователь может увеличить размер окна. Значение 0 - нет ограничения' //eslint-disable-line
},
{
  id: 'maxHeight',
  label: 'Максимальная высота',
  description: 'Максимальная высота окна приложения, до которой пользователь может увеличить размер окна. Значение 0 - нет ограничения' //eslint-disable-line
},
];
