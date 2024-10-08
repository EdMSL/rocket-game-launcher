import {
  IError,
  ISuccess,
} from '$types/common';
import {
  IGameSettingsConfig, IGameSettingsOptionItem, IGameSettingsOption, IModOrganizerParams,
} from '$types/gameSettings';
import {
  ILauncherConfig,
  ILauncherCustomButton,
  IWindowSettings,
} from '$types/main';
import {
  Encoding,
  GameSettingsOptionType,
  LauncherButtonAction,
  PathVariableName,
} from './misc';

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

export const MinWindowSize = {
  HEIGHT: 300,
  WIDTH: 300,
};

export const TEXT_INPUT_MAX_LENGTH = 50;

export const emptyGameSettingsGroup = {
  id: '', name: '', label: '',
};

export const defaultLauncherWindowSettings: IWindowSettings = {
  isResizable: false,
  width: 800,
  height: 600,
  minWidth: MinWindowSize.WIDTH,
  minHeight: MinWindowSize.HEIGHT,
  maxWidth: 0,
  maxHeight: 0,
};

export const defaultDevWindowResolution = {
  width: 1100,
  height: 700,
  minWidth: 800,
  minHeight: 600,
  maxWidth: 0,
  maxHeight: 0,
};

export const defaultLauncherCustomButton: ILauncherCustomButton = {
  id: '',
  action: LauncherButtonAction.OPEN,
  label: '',
  path: '',
  args: [],
};

export const LAUNCHER_CONFIG_FILE_NAME = 'config.json';
export const GAME_SETTINGS_CONFIG_FILE_NAME = 'settings.json';
export const MO_INI_FILE_NAME = 'ModOrganizer.ini';

export const defaultModOrganizerPaths = {
  pathToMOFolder: `${PathVariableName.GAME_DIR}\\Mod Organizer`,
  pathToINI: `${PathVariableName.MO_DIR}\\${MO_INI_FILE_NAME}`,
  pathToProfiles: `${PathVariableName.MO_DIR}\\profiles`,
  pathToMods: `${PathVariableName.MO_DIR}\\mods`,
};

export const defaultModOrganizerParams: IModOrganizerParams = {
  isUsed: false,
  pathToMOFolder: `${PathVariableName.GAME_DIR}\\MO2`,
};

export const defaultLauncherConfig: ILauncherConfig = {
  isResizable: defaultLauncherWindowSettings.isResizable,
  minWidth: defaultLauncherWindowSettings.minWidth,
  minHeight: defaultLauncherWindowSettings.minHeight,
  maxWidth: defaultLauncherWindowSettings.maxWidth,
  maxHeight: defaultLauncherWindowSettings.maxHeight,
  width: defaultLauncherWindowSettings.width,
  height: defaultLauncherWindowSettings.height,
  isFirstStart: true,
  gameName: 'Rocket Game Launcher',
  playButton: {
    path: '',
    args: [],
    label: 'Играть',
  },
  customButtons: [],
};

export const defaultGameSettingsConfig: IGameSettingsConfig = {
  baseFilesEncoding: Encoding.WIN1251,
  documentsPath: PathVariableName.DOCUMENTS,
  modOrganizer: defaultModOrganizerParams,
  gameSettingsGroups: [],
  gameSettingsFiles: [],
  gameSettingsOptions: [],
};

export const defaultGameSettingsOptionItem: IGameSettingsOptionItem = {
  id: '',
  name: '',
  controllerType: undefined,
  iniGroup: '',
  min: 0,
  max: 1,
  step: 0.1,
  selectOptions: {},
  selectOptionsValueString: '',
  valueAttribute: '',
  valuePath: '',
};

export const defaultFullGameSettingsOption: IGameSettingsOption = {
  id: '',
  optionType: GameSettingsOptionType.DEFAULT,
  file: '',
  label: '',
  description: '',
  settingGroup: '',
  controllerType: undefined,
  separator: ':',
  selectOptions: {},
  selectOptionsValueString: '',
  min: 0,
  max: 1,
  step: 0.1,
  items: [defaultGameSettingsOptionItem],
};

interface IWindowField {
  name: string,
  label: string,
  description: string,
}

export const appWindowFields: IWindowField[] = [{
  name: 'width',
  label: 'Ширина по умолчанию',
  description: 'Ширина окна приложения по умолчанию. Является постоянной, если размеры окна установлены как неизменяемые, и начальной, если размеры окна изменяемые.' //eslint-disable-line
},
{
  name: 'height',
  label: 'Высота по умолчанию',
  description: 'Высота окна приложения по умолчанию. Является постоянной, если размеры окна установлены как неизменяемые, и начальной, если размеры окна изменяемые.' //eslint-disable-line
},
{
  name: 'minWidth',
  label: 'Минимальная ширина',
  description: `Минимальная ширина, до которой пользователь может уменьшить размер окна. Минимально допустимое значение - ${MinWindowSize.WIDTH}` //eslint-disable-line
},
{
  name: 'minHeight',
  label: 'Минимальная высота',
  description: `Минимальная высота, до которой пользователь может уменьшить размер окна. Минимально допустимое значение - ${MinWindowSize.HEIGHT}` //eslint-disable-line
},
{
  name: 'maxWidth',
  label: 'Максимальная ширина',
  description: 'Максимальная ширина, до которой пользователь может увеличить размер окна. Значение 0 - нет ограничения.' //eslint-disable-line
},
{
  name: 'maxHeight',
  label: 'Максимальная высота',
  description: 'Максимальная высота, до которой пользователь может увеличить размер окна. Значение 0 - нет ограничения.' //eslint-disable-line
},
];
