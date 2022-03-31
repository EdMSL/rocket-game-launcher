import { IPathVariables } from '$constants/paths';
import { ILauncherConfig, IUserMessage } from './main';

export const DEVELOPER_TYPES = {
  SET_LAUNCHER_CONFIG: 'SET_LAUNCHER_CONFIG',
  SET_MESSAGES: 'SET_MESSAGES',
  ADD_MESSAGES: 'ADD_MESSAGES',
  DELETE_MESSAGES: 'DELETE_MESSAGES',
};

export type IDeveloperRootState = Readonly<{
  config: ILauncherConfig,
  pathVariables: IPathVariables,
  isGameSettingsConfigLoading: boolean,
  isGameSettingsConfigSaving: boolean,
  messages: IUserMessage[],
}>;
