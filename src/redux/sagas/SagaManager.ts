import {
  take, fork, cancel,
} from 'redux-saga/effects';
import { SagaIterator } from '@redux-saga/types';

import mainSaga from '$sagas/main';
import gameSetingsSaga from '$sagas/gameSettings';
import developerSaga from './developer';

const appSagas = [mainSaga, gameSetingsSaga];
const developerSagas = [developerSaga];

export const CANCEL_SAGAS_HMR = 'CANCEL_SAGAS_HMR';

const createAbortableSaga = (saga): ReturnType<typeof saga> => {
  if (process.env.NODE_ENV === 'development') {
    return function* main(): SagaIterator<void> {
      const sagaTask = yield fork(saga);

      yield take(CANCEL_SAGAS_HMR);
      yield cancel(sagaTask);
    };
  }
  return saga;
};

export const SagaManager = {
  startAppSagas(sagaMiddleware): void {
    appSagas.map(createAbortableSaga).forEach((saga) => sagaMiddleware.run(saga));
  },

  startDeveloperSagas(sagaMiddleware): void {
    developerSagas.map(createAbortableSaga).forEach((saga) => sagaMiddleware.run(saga));
  },

  cancelSagas(store): void {
    store.dispatch({
      type: CANCEL_SAGAS_HMR,
    });
  },
};
