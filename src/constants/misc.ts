export const Scope = {
  MAIN: 'main',
  RENDERER: 'renderer',
};

export const Encoding = {
  UTF8: 'utf-8',
  WIN1251: 'win1251',
  CP866: 'cp866',
};

export const GAME_SETTINGS_CONFIG_REQUIRE_FIELDS = ['usedFiles'];
export const GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS = [
  'settingGroups', 'basePathToFiles', 'baseFilesEncoding',
];
export const GAME_SETTINGS_CONFIG_ALL_FIELDS = [
  ...GAME_SETTINGS_CONFIG_REQUIRE_FIELDS,
  ...GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS];
