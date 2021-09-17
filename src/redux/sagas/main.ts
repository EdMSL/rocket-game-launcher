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
import {
  addMessages,
  setGameSettingsFilesBackup,
  setIsGameSettingsFilesBackuping,
  setIsLauncherInitialised,
} from '$actions/main';
import { initGameSettingsSaga, setInitialGameSettingsConfigSaga } from '$sagas/gameSettings';
import { GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  CustomError, ReadWriteError, SagaError,
} from '$utils/errors';
import { MAIN_TYPES } from '$types/main';
import { CreateUserMessage } from '$utils/message';
import { createGameSettingsFilesBackup, getGameSettingsFilesBackup } from '$utils/backup';
import { getPathToFile } from '$utils/strings';
import { IUnwrap } from '$types/common';

const getState = (state: IAppState): IAppState => state;

/**
 * Инициализация лаунчера при запуске.
*/
function* initLauncherSaga(): SagaIterator {
  yield put(setIsLauncherInitialised(false));

  try {
    if (fs.existsSync(GAME_SETTINGS_FILE_PATH)) {
      yield call(setInitialGameSettingsConfigSaga);
    } else {
      writeToLogFile('Game settings file settings.json not found.');
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
      `An error occured during launcher initialization: ${errorMessage}`,
      LogMessageType.ERROR,
    );
  } finally {
    yield put(setIsLauncherInitialised(true));
  }
}

function* createGameSettingsBackupSaga(): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    const {
      system: { customPaths },
      gameSettings: { gameSettingsFiles, moProfile },
    }: IAppState = yield select(getState);

    const filesForBackupPaths = Object.keys(gameSettingsFiles).map((fileName) => getPathToFile(gameSettingsFiles[fileName].path, customPaths, moProfile));

    yield call(createGameSettingsFilesBackup, filesForBackupPaths);

    yield put(addMessages([CreateUserMessage.success('Бэкап файлов успешно создан.')]));
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to create game settings files backup. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при создании бэкапа файлов игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

function* getGameSettingsFilesBackupSaga(): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    const result: IUnwrap<typeof getGameSettingsFilesBackup> = yield call(getGameSettingsFilesBackup);

    yield put(setGameSettingsFilesBackup(result));
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to get game settings files backup. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при получении списка бэкапов файлов игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

// function* deleteGameSettingsFilesBackupSaga({
//   payload: iniBackupId,
// }: ReturnType<typeof MAIN_ACTIONS.deleteIniBackup>): SagaIterator {
//   const deleteResult: IMessage = yield call(deleteInisBackup, iniBackupId.split('-')[1]);

//   if (deleteResult.status === SUCCESS_STATUS) {
//     yield call(getBackupSaga);
//   } else {
//     const {
//       main: { messages },
//     }: IAppState = yield select(getState);

//     yield put(MAIN_ACTIONS.setMessages([...messages, deleteResult]));
//   }
// }

// function* restoreGameSettingsFilesBackupSaga({
//   payload: iniBackupFiles,
// }: ReturnType<typeof MAIN_ACTIONS.restoreIniBackup>): SagaIterator {
//   yield put(MAIN_ACTIONS.setIsInisBackuping(true));

//   const restoreResult: IMessage = yield call(restoreIniBackup, iniBackupFiles);

//   if (restoreResult) {
//     const {
//       main: { messages },
//     }: IAppState = yield select(getState);

//     yield put(MAIN_ACTIONS.setMessages([...messages, restoreResult]));
//     yield call(initSettingsSaga);
//   }

//   yield put(MAIN_ACTIONS.setIsInisBackuping(false));
// }

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  const {
    main: { isLauncherInitialised, isGameSettingsLoaded },
  }: IAppState = yield select(getState);

  if (!isLauncherInitialised && location.pathname === `${Routes.MAIN_SCREEN}`) {
    yield call(initLauncherSaga);
  }

  if (location.pathname.includes(`${Routes.GAME_SETTINGS_SCREEN}`)) {
    if (isLauncherInitialised && !isGameSettingsLoaded) {
      yield call(initGameSettingsSaga);
    } else if (!isLauncherInitialised) {
      yield put(push(`${Routes.MAIN_SCREEN}`));
    }
  }
}

/* eslint-disable max-len */
export default function* mainSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
  yield takeLatest(MAIN_TYPES.CREATE_GAME_SETTINGS_FILES_BACKUP, createGameSettingsBackupSaga);
  yield takeLatest(MAIN_TYPES.GET_GAME_SETTINGS_FILES_BACKUP, getGameSettingsFilesBackupSaga);
  // yield takeLatest(MAIN_TYPES.DELETE_GAME_SETTINGS_FILES_BACKUP, deleteGameSettingsFilesBackupSaga);
  // yield takeLatest(MAIN_TYPES.RESTORE_GAME_SETTINGS_FILES_BACKUP, restoreGameSettingsFilesBackupSaga);
}
