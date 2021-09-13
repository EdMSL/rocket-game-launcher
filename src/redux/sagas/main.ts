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
  addMessages, setIsGameSettingsFilesBackuping, setIsLauncherInitialised,
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
import { GameSettingsFilesBackup } from '$utils/backup';
import { getPathToFile } from '$utils/files';

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

    yield call(GameSettingsFilesBackup, filesForBackupPaths);

    yield put(addMessages([CreateUserMessage.success('Бэкап файлов успешно создан.')]));
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
      `Game settings files backuping failed. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при создании бэкапа файлов игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

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

export default function* mainSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
  yield takeLatest(MAIN_TYPES.CREATE_GAME_SETTING_BACKUP, createGameSettingsBackupSaga);
}
