import {
  push, LOCATION_CHANGE, LocationChangeAction,
} from 'connected-react-router';
import { SagaIterator } from 'redux-saga';
import { select, takeLatest } from 'redux-saga/effects';

import { ILocationState } from '$types/common';
import { IDeveloperState } from '$store/store';

const getState = (state: IDeveloperState): IDeveloperState => state;

function* locationChangeSaga(
  { payload: { location } }: LocationChangeAction<ILocationState>,
): SagaIterator {
  const {
    developer: {
      config: { isFirstLaunch },
    },
  }: ReturnType<typeof getState> = yield select(getState);
}

/* eslint-disable max-len */
export default function* developerSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
