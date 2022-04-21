import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';
import { SagaIterator } from 'redux-saga';
import {
  call,
  delay,
  put, SagaReturnType, select, takeLatest,
} from 'redux-saga/effects';
import { ipcRenderer } from 'electron';

import { ILocationState } from '$types/common';
import { IDeveloperState } from '$store/store';
import {
  addDeveloperMessages,
  saveGameSettingsConfig,
  saveLauncherConfig,
  setGameSettingsConfig,
  setIsGameSettingsConfigLoaded,
  setIsGameSettingsConfigProcessing,
  setIsLauncherConfigProcessing,
  setLauncherConfig,
  setPathVariables,
  updateConfig,
} from '$actions/developer';
import { Routes } from '$constants/routes';
import { CreateUserMessage } from '$utils/message';
import {
  CustomError, ReadWriteError, SagaError,
} from '$utils/errors';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { getGameSettingsConfigSaga } from './gameSettings';
import { DEVELOPER_TYPES } from '$types/developer';
import { AppChannel } from '$constants/misc';
import { writeJSONFile } from '$utils/files';
import { CONFIG_FILE_PATH, GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { deepClone, updatePathVariables } from '$utils/data';
import {
  checkObjectForEqual, getWindowSettingsFromLauncherConfig,
} from '$utils/check';
import { defaultGameSettingsConfig } from '$constants/defaultData';

const getState = (state: IDeveloperState): IDeveloperState => state;

/**
 * Инициализация игровых настроек для режима разработчика.
 * Только проверка полей на валидность и запись в `state`.
 */
export function* initGameSettingsDeveloperSaga(): SagaIterator {
  yield call(
    ipcRenderer.send,
    AppChannel.SAVE_DEV_CONFIG,
    true,
    undefined,
    undefined,
    undefined,
    undefined,
  );

  try {
    yield put(setIsGameSettingsConfigProcessing(true));

    const {
      data: settingsConfig,
      errors,
    }: SagaReturnType<typeof getGameSettingsConfigSaga> = yield call(getGameSettingsConfigSaga);

    if (errors.length > 0) {
      yield put(addDeveloperMessages([CreateUserMessage.warning('Обнаружены ошибки в файле settings.json. Подробности в файле лога.')]));//eslint-disable-line max-len
    }

    yield put(setGameSettingsConfig(settingsConfig));
    yield put(setIsGameSettingsConfigLoaded(true));
    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, undefined, settingsConfig, undefined, undefined, false);
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path "${error.path}".`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFile(errorMessage);

    yield put(setIsGameSettingsConfigLoaded(false));
  } finally {
    yield put(setIsGameSettingsConfigProcessing(false));
    yield call(
      ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      false,
      undefined,
      undefined,
      undefined,
      undefined,
    );
  }
}

function* updateConfigSaga({ payload: configName }: ReturnType<typeof updateConfig>): SagaIterator {
  if (configName === 'gameSettings') {
    yield call(initGameSettingsDeveloperSaga);
  }
}

function* saveLauncherConfigSaga(
  { payload: { newConfig, isGoToMainScreen } }: ReturnType<typeof saveLauncherConfig>,
): SagaIterator {
  // Ставим здесь именно сохранение игровых настроек только из-за показа лоадера
  yield put(setIsLauncherConfigProcessing(true));
  yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, true);
  yield delay(2000);

  try {
    yield call(writeJSONFile, CONFIG_FILE_PATH, deepClone(newConfig, 'id'));

    const {
      developer: { pathVariables },
    }: ReturnType<typeof getState> = yield select(getState);

    const newPathVariables = updatePathVariables(pathVariables, newConfig);

    const {
      developer: {
        launcherConfig,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const isChangeWindowSize = !checkObjectForEqual(
      getWindowSettingsFromLauncherConfig(launcherConfig),
      getWindowSettingsFromLauncherConfig(newConfig),
    );

    yield call(
      ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      false,
      newConfig,
      newPathVariables,
      isChangeWindowSize,
    );

    yield put(setLauncherConfig(newConfig));
    yield put(setPathVariables(newPathVariables));

    if (isGoToMainScreen) {
      yield call(ipcRenderer.send, AppChannel.CHANGE_DEV_WINDOW_STATE, false);
    }
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to save launcher configuration file. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addDeveloperMessages([CreateUserMessage.error('Произошла ошибка при сохранении файла конфигурации. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsLauncherConfigProcessing(false));
  }
}

function* saveGameSettingsConfigSaga(
  { payload: { newConfig, isGoToMainScreen } }: ReturnType<typeof saveGameSettingsConfig>,
): SagaIterator {
  yield put(setIsGameSettingsConfigProcessing(true));
  yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, true);
  yield delay(2000);
  try {
    if (!newConfig.baseFilesEncoding) {
      newConfig.baseFilesEncoding = defaultGameSettingsConfig.baseFilesEncoding;//eslint-disable-line no-param-reassign, max-len
    }

    yield call(writeJSONFile, GAME_SETTINGS_FILE_PATH, deepClone(newConfig, 'id'));
    yield put(setGameSettingsConfig(newConfig));

    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, false, newConfig);

    if (isGoToMainScreen) {
      yield call(ipcRenderer.send, AppChannel.CHANGE_DEV_WINDOW_STATE, false);
    }
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to save game settings file. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addDeveloperMessages([CreateUserMessage.error('Произошла ошибка при сохранении файла игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsConfigProcessing(false));
  }
}

function* locationChangeSaga(
  { payload: { location } }: LocationChangeAction<ILocationState>,
): SagaIterator {
  const {
    developer: {
      isGameSettingsConfigLoaded,
    },
  }: ReturnType<typeof getState> = yield select(getState);

  if (location.pathname === Routes.DEVELOPER_SCREEN_GAME_SETTINGS && !isGameSettingsConfigLoaded) {
    yield call(initGameSettingsDeveloperSaga);
  }
}

/* eslint-disable max-len */
export default function* developerSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
  yield takeLatest(DEVELOPER_TYPES.UPDATE_CONFIG, updateConfigSaga);
  yield takeLatest(DEVELOPER_TYPES.SAVE_LAUNCHER_CONFIG, saveLauncherConfigSaga);
  yield takeLatest(DEVELOPER_TYPES.SAVE_GAME_SETTINGS_CONFIG, saveGameSettingsConfigSaga);
}
