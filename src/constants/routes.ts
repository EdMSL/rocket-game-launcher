export enum DeveloperScreenName {
  LAUNCHER = 'config',
  GAME_SETTINGS = 'settings',
}

export const Routes = {
  MAIN_SCREEN: '/main',
  GAME_SETTINGS_SCREEN: '/main/gameSettings',
  DEVELOPER_SCREEN: '/developer',
  DEVELOPER_SCREEN_CONFIG: `/developer/${DeveloperScreenName.LAUNCHER}`,
  DEVELOPER_SCREEN_GAME_SETTINGS: `/developer/${DeveloperScreenName.GAME_SETTINGS}`,
};

export const GAME_SETTINGS_PATH_REGEXP = new RegExp(Routes.GAME_SETTINGS_SCREEN);
