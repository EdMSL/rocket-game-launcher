import {
  push, LOCATION_CHANGE, LocationChangeAction,
} from 'connected-react-router';
import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import fs from 'fs';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import { setIsLauncherInitialised } from '$actions/main';
import { initGameSettingsSaga, setGameSettingsSaga } from '$sagas/gameSettings';
import { GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { LogMessageType, writeToLogFile } from '$utils/log';

const getState = (state: IAppState): IAppState => state;

export function* initLauncherSaga(): SagaIterator {
  yield put(setIsLauncherInitialised(false));

  try {
    if (fs.existsSync(GAME_SETTINGS_FILE_PATH)) {
      yield call(setGameSettingsSaga);
    } else {
      writeToLogFile('Game settings file settings.json not found.');
    }
  } catch (error) {
    writeToLogFile(error.message, LogMessageType.ERROR);
  } finally {
    yield put(setIsLauncherInitialised(true));
  }
}

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  const {
    main: { isLauncherInitialised },
  }: IAppState = yield select(getState);

  if (!isLauncherInitialised && location.pathname === `${Routes.MAIN_SCREEN}`) {
    yield call(initLauncherSaga);
  }

  if (location.pathname === `${Routes.GAME_SETTINGS_SCREEN}`) {
    if (isLauncherInitialised) {
      yield call(initGameSettingsSaga);
    } else {
      yield put(push(`${Routes.MAIN_SCREEN}`));
    }
  }
}

export default function* mainSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
