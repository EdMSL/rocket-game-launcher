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

export type ISystemRootState = Readonly<{
  isResizable: boolean,
  minWidth: number,
  minHeight: number,
  width: number,
  height: number,
  isFirstLaunch: boolean,
  modOrganizer: IModOrganizerParams,
  documentsPath: string,
  customPaths: { [label: string]: string, },
}>;
