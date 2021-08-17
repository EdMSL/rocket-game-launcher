import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import path from 'path';
import fs from 'fs';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import { readINIFile, writeINIFile } from '$utils/files';
import { IUnwrap } from '$types/common';
import { setIsGameSettingsLoaded, setIsLauncherInitialised } from '$actions/main';
import { setGameSettingsSaga } from '$sagas/gameSettings';
import { GAME_SETTINGS_PATH } from '$constants/paths';
import { LOG_MESSAGE_TYPE, writeToLogFile } from '$utils/log';

const getState = (state: IAppState): IAppState => state;

export function* initLauncherSaga(): SagaIterator {
  yield put(setIsLauncherInitialised(false));

  try {
    if (fs.existsSync(GAME_SETTINGS_PATH)) {
      yield call(setGameSettingsSaga);
    } else {
      writeToLogFile('Game settings file settings.json not found.');
    }
  } catch (error) {
    writeToLogFile(error.message, LOG_MESSAGE_TYPE.ERROR);
  } finally {
    yield put(setIsLauncherInitialised(true));
  }
}

export function* initGameSettingsSaga(): SagaIterator {
  try {
    yield call(setIsGameSettingsLoaded, false);

    const file: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve('./src/tests/fixtures/Blockhead.ini'),
    );

    file.addSection('Section #9');

    yield call(writeINIFile, path.resolve('./src/tests/fixtures/Blockhead.ini'), file);
  } catch (error) {
    console.log(error.message);
  } finally {
    yield call(setIsGameSettingsLoaded, true);
  }
}

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  const {
    main: { isLauncherInitialised },
  }: IAppState = yield select(getState);

  if (!isLauncherInitialised && location.hash === `#${Routes.MAIN_SCREEN}`) {
    yield call(initLauncherSaga);
  }
}

export default function* mainSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
