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
};

export const HTMLInputType = {
  CHECKBOX: 'checkbox',
  RANGE: 'range',
  SELECT: 'select-one',
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
  MO: '%MO%',
  DOCUMENTS: '%DOCUMENTS%',
  GAMEDIR: '%GAMEDIR%',
};

export const CustomPathName = {
  ...DefaultCustomPathName,
  MO_REGEXP: new RegExp('%MO%'),
  DOCUMENTS_REGEXP: new RegExp('%DOCUMENTS%'),
  GAMEDIR_REGEXP: new RegExp('%GAMEDIR%'),
  CUSTOM_NAME_REGEXP: /^%[A-Z]+%$/,
  CUSTOM_PATH_REGEXP: /^%[A-Z]+%/,
};

export const LauncherButtonAction = {
  RUN: 'run',
  OPEN: 'open',
};
