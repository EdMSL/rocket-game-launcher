export const SYSTEM_TYPES = {
  SET_IS_FIRST_LAUNCH: 'SET_IS_FIRST_LAUNCH',
};

export interface IModOrganizerParams {
  isUsed: boolean,
  version: number,
  path: string,
  pathToINI: string,
  pathToProfiles: string,
  profileSection: string,
  profileParam: string,
  profileParamValueRegExp: string,
}

export interface ILauncherAppButton {
  path: string,
  label: string,
  args?: string[],
}

export interface ILauncherCustomButton extends ILauncherAppButton {
  id: string,
  action: string,
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
  gameName: string,
  playButton: ILauncherAppButton,
  customButtons: ILauncherCustomButton[],
}>;
