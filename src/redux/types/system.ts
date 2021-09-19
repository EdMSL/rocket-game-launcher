export const SYSTEM_TYPES = {
  SET_IS_FIRST_LAUNCH: 'SET_IS_FIRST_LAUNCH',
};

interface IModOrganizerParams {
  isUsed: boolean,
  path: string,
  pathToINI: string,
  pathToProfiles: string,
  profileSection: string,
  profileParam: string,
  profileParamValueRegExp: string,
}

interface ILauncherAppsButton {
  action: string,
  path: string,
  label: string,
}

export type ISystemRootState = Readonly<{
  isResizable: boolean,
  minWidth: number,
  minHeight: number,
  maxWidth: number,
  maxHeight: number,
  width: number,
  height: number,
  isFirstLaunch: boolean,
  modOrganizer: IModOrganizerParams,
  documentsPath: string,
  customPaths: { [label: string]: string, },
  playButton: string,
  buttons: ILauncherAppsButton[],
}>;
