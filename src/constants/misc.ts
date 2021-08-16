export const Scope = {
  MAIN: 'main',
  RENDERER: 'renderer',
};

export const Encoding = {
  UTF8: 'utf-8',
  WIN1251: 'win1251',
  CP866: 'cp866',
};

export const GAME_SETTINGS_CONFIG_REQUIRE = ['settingGroups', 'usedFiles'];
export const GAME_SETTINGS_CONFIG_OPTIONAL = ['basePathToFiles', 'baseFilesEncoding'];
export const GAME_SETTINGS_CONFIG_ALL = [
  ...GAME_SETTINGS_CONFIG_REQUIRE,
  ...GAME_SETTINGS_CONFIG_OPTIONAL];
