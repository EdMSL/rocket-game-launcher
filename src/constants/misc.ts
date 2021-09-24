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

export const GameSettingParameterType = {
  DEFAULT: 'default',
  GROUP: 'group',
  RELATED: 'related',
  COMBINED: 'combined',
};

export const RangeButtonName = {
  DECREASE: 'decrease',
  INCREASE: 'increase',
};

export const DefaultCustomPathName = {
  MO_PROFILES: '%MO_PROFILES%',
  MO_DIR: '%MO_DIR%',
  DOCUMENTS: '%DOCUMENTS%',
  GAME_DIR: '%GAME_DIR%',
};

export const CustomPathName = {
  ...DefaultCustomPathName,
  MO_PROFILES_REGEXP: new RegExp('%MO_PROFILES%'),
  MO_DIR_REGEXP: new RegExp('%MO_DIR%'),
  DOCUMENTS_REGEXP: new RegExp('%DOCUMENTS%'),
  GAME_DIR_REGEXP: new RegExp('%GAME_DIR%'),
  CUSTOM_NAME_REGEXP: /^%[A-Z_]+%$/,
  CUSTOM_PATH_REGEXP: /^%[A-Z_]+%/,
  CORRECT_PATH_REGEXP: /^[^.]/,
};

export const LauncherButtonAction = {
  RUN: 'run',
  OPEN: 'open',
};
