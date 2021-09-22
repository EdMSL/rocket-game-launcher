import {
  push, LOCATION_CHANGE, LocationChangeAction,
} from 'connected-react-router';
import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
  SagaReturnType,
} from 'redux-saga/effects';
import fs from 'fs';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import {
  addMessages,
  setGameSettingsFilesBackup,
  setIsGameSettingsFilesBackuping,
  setIsLauncherInitialised,
  createGameSettingsFilesBackup as createGameSettingsFilesBackupAction,
  deleteGameSettingsFilesBackup as deleteGameSettingsFilesBackupAction,
  restoreGameSettingsFilesBackup,
  setUserThemes,
} from '$actions/main';
import {
  generateGameSettingsOptionsSaga,
  IGenerateGameSettingsOptionsResult,
  initGameSettingsSaga,
  setInitialGameSettingsConfigSaga,
} from '$sagas/gameSettings';
import { GAME_SETTINGS_FILE_PATH, USER_THEMES_PATH } from '$constants/paths';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  CustomError, ReadWriteError, SagaError,
} from '$utils/errors';
import { MAIN_TYPES } from '$types/main';
import { CreateUserMessage } from '$utils/message';
import {
  createGameSettingsFilesBackup,
  deleteGameSettingsFilesBackup,
  getGameSettingsFilesBackups,
  restoreBackupFiles,
} from '$utils/backup';
import { getPathToFile } from '$utils/strings';
import { IUnwrap } from '$types/common';
import { setGameSettingsOptions } from '$actions/gameSettings';
import { getUserThemesFolders } from '$utils/files';
import { setUserTheme } from '$actions/userSettings';

const getState = (state: IAppState): IAppState => state;

/**
 * Получить список пользовательских тем.
*/
function* getUserThemesSaga(): SagaIterator<{ [key: string]: string, }> {
  try {
    let themesFolders: string[] = [];

    if (fs.existsSync(USER_THEMES_PATH)) {
      themesFolders = yield call(getUserThemesFolders);
    }

    const themesObjects = themesFolders.reduce((themes, theme) => ({
      ...themes,
      [theme]: theme,
    }), {});

    return {
      '': 'default',
      ...themesObjects,
    };
  } catch (error: any) {
    writeToLogFile(`Failed to get user themes list. Will be used default theme. Reason: ${error.message}`); //eslint-disable-line max-len

    return {
      '': 'default',
    };
  }
}

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

    const themes: SagaReturnType<typeof getUserThemesSaga> = yield call(getUserThemesSaga);

    // 1 т.к. есть одна дефолтная тема со значение ''.
    if (Object.keys.length === 1) {
      const { userSettings: { theme } }: IAppState = yield select(getState);

      if (theme !== '') {
        writeToLogFile(
          'No themes found, but user theme is set in storage. Theme will be set to default.',
          LogMessageType.WARNING,
        );
        yield put(setUserTheme(''));
      }
    }

    yield put(setUserThemes(themes));
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

function* getGameSettingsFilesBackupSaga(isExternalCall = true): SagaIterator {
  try {
    if (isExternalCall) {
      yield put(setIsGameSettingsFilesBackuping(true));
    }

    const result: IUnwrap<typeof getGameSettingsFilesBackups> = yield call(getGameSettingsFilesBackups);

    yield put(setGameSettingsFilesBackup(result));
  } catch (error: any) {
    if (isExternalCall) {
      throw new SagaError('Get game settings files backup', error.message);
    } else {
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
    }
  } finally {
    if (isExternalCall) {
      yield put(setIsGameSettingsFilesBackuping(false));
    }
  }
}

function* createGameSettingsBackupSaga(
  { payload: isGetBackup }: ReturnType<typeof createGameSettingsFilesBackupAction>,
): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    const {
      system: { customPaths },
      gameSettings: { gameSettingsFiles, moProfile },
    }: IAppState = yield select(getState);

    const filesForBackupPaths = Object.keys(gameSettingsFiles).map((fileName) => getPathToFile(gameSettingsFiles[fileName].path, customPaths, moProfile));

    yield call(createGameSettingsFilesBackup, filesForBackupPaths);

    yield put(addMessages([CreateUserMessage.success('Бэкап файлов успешно создан.')]));

    if (isGetBackup) {
      yield call(getGameSettingsFilesBackupSaga, false);
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
      `Failed to create game settings files backup. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при создании бэкапа файлов игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

function* deleteGameSettingsFilesBackupSaga({
  payload: iniBackupId,
}: ReturnType<typeof deleteGameSettingsFilesBackupAction>): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    const deleteResultMessage: IUnwrap<typeof deleteGameSettingsFilesBackup> = yield call(
      deleteGameSettingsFilesBackup, iniBackupId,
    );

    if (deleteResultMessage.length > 0) {
      yield put(addMessages(deleteResultMessage));
    }

    yield call(getGameSettingsFilesBackupSaga, false);
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
      `Failed to create game settings files backup. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла критическая ошибка в процессе удаления файлов бэкапа. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

function* restoreGameSettingsFilesBackupSaga({
  payload: filesBackup,
}: ReturnType<typeof restoreGameSettingsFilesBackup>): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    yield call(restoreBackupFiles, filesBackup);

    const {
      gameSettings: {
        gameSettingsFiles,
        moProfile,
      },
    }: IAppState = yield select(getState);

    const {
      totalGameSettingsOptions,
    }: IUnwrap<IGenerateGameSettingsOptionsResult> = yield call(
      generateGameSettingsOptionsSaga,
      gameSettingsFiles,
      moProfile,
    );

    yield put(setGameSettingsOptions(totalGameSettingsOptions));
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
      `Failed to restore game settings files from backup. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла критическая ошибка в процессе восстановления файлов из бэкапа. Файлы не были восстановлены. Подробности в файле лога.')])); //eslint-disable-line max-len
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

/* eslint-disable max-len */
export default function* mainSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
  yield takeLatest(MAIN_TYPES.CREATE_GAME_SETTINGS_FILES_BACKUP, createGameSettingsBackupSaga);
  yield takeLatest(MAIN_TYPES.GET_GAME_SETTINGS_FILES_BACKUP, getGameSettingsFilesBackupSaga);
  yield takeLatest(MAIN_TYPES.DELETE_GAME_SETTINGS_FILES_BACKUP, deleteGameSettingsFilesBackupSaga);
  yield takeLatest(MAIN_TYPES.RESTORE_GAME_SETTINGS_FILES_BACKUP, restoreGameSettingsFilesBackupSaga);
}
