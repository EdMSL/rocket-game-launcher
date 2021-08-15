import { SagaIterator } from 'redux-saga';
import {
  call,
  takeLatest,
} from 'redux-saga/effects';
import path from 'path';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';

import { IAppState } from '$store/store'; //eslint-disable-line import/no-cycle
import { Routes } from '$constants/routes';
import { readINIFile, writeINIFile } from '$utils/files';
import { IUnwrap } from '$constants/interfaces';

const getState = (state: IAppState): IAppState => state;

export function* initSettingsSaga(): SagaIterator {
  try {
    const file: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve('./src/tests/fixtures/Blockhead.ini'),
    );

    file.addSection('Section #9');

    yield call(writeINIFile, path.resolve('./src/tests/fixtures/Blockhead.ini'), file);
  } catch (error) {
    console.log(error.message);
  }
}

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  if (location.hash === `#${Routes.GAME_SETTINGS_SCREEN}`) {
    yield call(initSettingsSaga);
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
