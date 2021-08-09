import {
  IError,
  ISuccess,
} from '$constants/interfaces';
import { ISystemRootState } from '$reducers/system';

export const SUCCESS_STATUS: ISuccess = 'success';
export const ERROR_STATUS: IError = 'error';
export const WARNING_STATUS = 'warning';

export const defaultLauncherResolution = {
  width: 1024,
  height: 768,
};

export const defaultLauncherConfig: ISystemRootState = {
  isFirstLaunch: true,
};
