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
export const GAME_SETTINGS_CONFIG_ALL_MAIN_FIELDS = [
  ...GAME_SETTINGS_CONFIG_REQUIRE_FIELDS,
  ...GAME_SETTINGS_CONFIG_OPTIONAL_FIELDS];
export const GAME_SETTINGS_CONFIG_SETTING_GROUP_FIELDS = ['name', 'label'];
export const USED_FILE_REQUIRED_FIELDS = ['path', 'type', 'parameters'];
export const USED_FILE_OPTIONAL_FIELDS = ['encoding', 'isFromMOProfile'];
