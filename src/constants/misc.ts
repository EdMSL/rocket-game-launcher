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
  CORRECT_PATH_REGEXP: /^[^.]/,
};

export const LauncherButtonAction = {
  RUN: 'run',
  OPEN: 'open',
};

export const FileExtension = {
  EXECUTABLE: ['exe', 'lnk'],
  INI: ['ini'],
};

export interface IWindowField {
  id: string,
  label: string,
}

export const appWindowFields: IWindowField[] = [{
  id: 'width',
  label: 'Ширина',
},
{
  id: 'height',
  label: 'Высота',
},
{
  id: 'minWidth',
  label: 'Минимальная ширина',
},
{
  id: 'minHeight',
  label: 'Минимальная высота',
},
{
  id: 'maxWidth',
  label: 'Максимальная ширина',
},
{
  id: 'maxHeight',
  label: 'Максимальная высота',
},
];
