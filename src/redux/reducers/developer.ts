import { createReducer } from 'reduxsauce';

import { DEVELOPER_HANDLERS } from '$handlers/developer';
import { IDeveloperRootState } from '$types/developer';
import { defaultGameSettingsConfig, defaultLauncherConfig } from '$constants/defaultData';
import { DefaultPathVariable } from '$constants/paths';

export const INITIAL_STATE: IDeveloperRootState = {
  launcherConfig: defaultLauncherConfig,
  gameSettingsConfig: defaultGameSettingsConfig,
  isLauncherConfigProcessing: false,
  isGameSettingsConfigProcessing: false,
  isGameSettingsConfigLoaded: false,
  isGameSettingsConfigChanged: false,
  pathVariables: DefaultPathVariable,
  messages: [],
};

export const developerReducer = createReducer<IDeveloperRootState>(INITIAL_STATE, DEVELOPER_HANDLERS);
