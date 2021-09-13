import { createReducer } from 'reduxsauce';

import { MAIN_HANDLERS } from '$handlers/main';
import { IMainRootState } from '$types/main';

const INITIAL_STATE: IMainRootState = {
  isLauncherInitialised: false,
  isGameRunning: false,
  isGameSettingsLoaded: false,
  isGameSettingsAvailable: false,
  isGameSettingsSaving: false,
  isGameSettingsFilesBackuping: false,
  messages: [],
};

export const mainReducer = createReducer<IMainRootState>(INITIAL_STATE, MAIN_HANDLERS);
