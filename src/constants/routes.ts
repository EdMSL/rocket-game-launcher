export const RoutesWindowName = {
  MAIN: 'main',
  DEV: 'developer',
};

export const Routes = {
  MAIN_SCREEN: `/${RoutesWindowName.MAIN}`,
  GAME_SETTINGS_SCREEN: `/${RoutesWindowName.MAIN}/gameSettings`,
  DEVELOPER_SCREEN: `/${RoutesWindowName.DEV}`,
  DEVELOPER_SCREEN_CONFIG: `/${RoutesWindowName.DEV}/config`,
  DEVELOPER_SCREEN_GAME_SETTINGS: `/${RoutesWindowName.DEV}/settings`,
};

export const GAME_SETTINGS_PATH_REGEXP = new RegExp(Routes.GAME_SETTINGS_SCREEN);
