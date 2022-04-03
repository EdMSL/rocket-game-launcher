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
  take,
} from 'redux-saga/effects';
import fs from 'fs';
import { ipcRenderer } from 'electron';

import { IAppState } from '$store/store';
import {
  GAME_SETTINGS_PATH_REGEXP, Routes,
} from '$constants/routes';
import {
  addMessages,
  setGameSettingsFilesBackup,
  setIsGameSettingsFilesBackuping,
  setIsLauncherInitialised,
  createGameSettingsFilesBackup as createGameSettingsFilesBackupAction,
  deleteGameSettingsFilesBackup as deleteGameSettingsFilesBackupAction,
  restoreGameSettingsFilesBackup,
  renameGameSettingsFilesBackup,
  setIsGameSettingsLoaded,
  setIsGameSettingsAvailable,
  setLauncherConfig,
  setIsGameSettingsSaving,
  setPathVariables,
  setIsGameSettingsLoading,
} from '$actions/main';
import {
  generateGameSettingsOptionsSaga,
  initGameSettingsSaga,
  getGameSettingsConfigSaga,
  // initGameSettingsDeveloperSaga,
} from '$sagas/gameSettings';
import {
  GAME_SETTINGS_FILE_PATH,
} from '$constants/paths';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import {
  CustomError, ErrorName, ReadWriteError, SagaError,
} from '$utils/errors';
import { MAIN_TYPES } from '$types/main';
import { CreateUserMessage } from '$utils/message';
import {
  createGameSettingsFilesBackup,
  deleteGameSettingsFilesBackup,
  getGameSettingsFilesBackups,
  renameGameSettingsFilesBackups,
  restoreBackupFiles,
} from '$utils/backup';
import { getPathToFile } from '$utils/strings';
import { ILocationState, IUnwrap } from '$types/common';
import { setGameSettingsConfig, setGameSettingsOptions } from '$actions/gameSettings';
import {
  deepClone, getGameSettingsOptionsWithDefaultValues, updatePathVariables,
} from '$utils/data';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { writeJSONFile } from '$utils/files';
import { AppChannel } from '$constants/misc';

const getState = (state: IAppState): IAppState => state;

/**
 * Инициализация лаунчера при запуске.
*/
function* initLauncherSaga(): SagaIterator {
  // yield put(setIsLauncherInitialised(false));

  try {
    if (fs.existsSync(GAME_SETTINGS_FILE_PATH)) {
      // yield call(getGameSettingsConfigSaga);
    } else {
      // writeToLogFile('Game settings file settings.json not found.');
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

function* updateGameSettingsOptionsSaga(): SagaIterator {
  yield put(setIsGameSettingsLoading(true));
  yield put(setIsGameSettingsLoaded(false));

  try {
    yield put(setIsGameSettingsAvailable(false));

    const newConfigData: SagaReturnType<typeof getGameSettingsConfigSaga> = yield call(
      getGameSettingsConfigSaga,
    );

    yield call(initGameSettingsSaga, true, newConfigData.data.gameSettingsFiles);
  } catch (error: any) {
    if (
      error instanceof SagaError
      && error.reason instanceof ReadWriteError
      && error.reason.cause.name === ErrorName.NOT_FOUND
    ) {
      writeToLogFile('Game settings file settings.json not found.', LogMessageType.ERROR);

      yield put(addMessages(
        [CreateUserMessage.error('Не найден файл settings.json, обновление прервано. Игровые настройки будут недоступны.')], // eslint-disable-line max-len
      ));
      yield put(push(`${Routes.MAIN_SCREEN}`));
      yield put(setIsGameSettingsLoaded(true));
    } else {
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
        `An error occured during update game settings options: ${errorMessage}`,
        LogMessageType.ERROR,
      );

      yield put(addMessages(
        [CreateUserMessage.error('Возникла ошибка в процессе обновления игровых настроек. Подробности в файле лога.')], // eslint-disable-line max-len
      ));
    }
  } finally {
    yield put(setIsGameSettingsLoading(false));
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
      main: { pathVariables },
      gameSettings: { gameSettingsFiles, moProfile },
    }: ReturnType<typeof getState> = yield select(getState);

    const filesForBackupPaths = Object.keys(gameSettingsFiles).map((fileName) => getPathToFile(
      gameSettingsFiles[fileName].path, pathVariables, moProfile,
    ));

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
  payload: backupName,
}: ReturnType<typeof deleteGameSettingsFilesBackupAction>): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    const deleteResultMessage: IUnwrap<typeof deleteGameSettingsFilesBackup> = yield call(
      deleteGameSettingsFilesBackup, backupName,
    );

    if (deleteResultMessage.length > 0) {
      yield put(addMessages(deleteResultMessage));
    }

    yield call(getGameSettingsFilesBackupSaga, false);
  } catch (error: any) {
    if (error instanceof ReadWriteError && error.cause.name === ErrorName.NOT_FOUND) {
      yield put(addMessages([CreateUserMessage.warning(
        'Не удалось удалить файлы бэкапа. Папка была удалена, перемещена или переименована.',
      )]));
      yield call(getGameSettingsFilesBackupSaga, false);

      writeToLogFileSync(
        `Failed to delete game settings files backup. Reason: ${error.message}. Path '${error.path}'.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
    } else {
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
        `Failed to delete game settings files backup. Reason: ${errorMessage}`,
        LogMessageType.ERROR,
      );

      yield put(addMessages([CreateUserMessage.error('Произошла ошибка в процессе удаления файлов бэкапа. Подробности в файле лога.')])); //eslint-disable-line max-len
    }
  } finally {
    yield put(setIsGameSettingsFilesBackuping(false));
  }
}

function* renameGameSettingsFilesBackupSaga({
  payload: { backupName, newBackupName },
}: ReturnType<typeof renameGameSettingsFilesBackup>): SagaIterator {
  try {
    yield put(setIsGameSettingsFilesBackuping(true));

    yield call(
      renameGameSettingsFilesBackups,
      backupName,
      newBackupName,
    );

    const {
      main: {
        gameSettingsFilesBackup,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const backupData = gameSettingsFilesBackup.map((currentBackup) => {
      if (currentBackup.name === backupName) {
        return {
          ...currentBackup,
          name: newBackupName,
        };
      }
      return currentBackup;
    });

    yield put(setGameSettingsFilesBackup(backupData));
  } catch (error: any) {
    if (error instanceof ReadWriteError && error.cause.name === ErrorName.NOT_FOUND) {
      yield put(addMessages([CreateUserMessage.warning(
        'Не удалось переименовать папку бэкапа. Папка была удалена, перемещена или переименована.',
      )]));
      yield call(getGameSettingsFilesBackupSaga, false);

      writeToLogFileSync(
        `Failed to rename game settings files backup. Reason: ${error.message}. Path '${error.path}'.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
    } else {
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
        `Failed to rename game settings files backup. Reason: ${errorMessage}`,
        LogMessageType.ERROR,
      );

      yield put(addMessages([CreateUserMessage.error('Произошла ошибка при попытке переименования папки бэкапа. Подробности в файле лога.')])); //eslint-disable-line max-len
    }
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
        gameSettingsParameters,
        moProfile,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const totalGameSettingsOptions: SagaReturnType<typeof generateGameSettingsOptionsSaga> = yield call(
      generateGameSettingsOptionsSaga,
      gameSettingsFiles,
      gameSettingsParameters,
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

function* locationChangeSaga(
  { payload: { location } }: LocationChangeAction<ILocationState>,
): SagaIterator {
  const {
    main: {
      isLauncherInitialised,
      isGameSettingsLoaded,
      config: { isFirstLaunch },
    },
  }: ReturnType<typeof getState> = yield select(getState);

  if (!isLauncherInitialised && (location.pathname === Routes.MAIN_SCREEN)) {
    yield call(initLauncherSaga);

    if (isFirstLaunch) {
      yield take(MAIN_TYPES.SET_IS_LAUNCHER_INITIALISED);

      // Здесь должен быть action на setDevWindowOpening, перенесен в storage основного процесса
      // чтобы убрать эффект мигания окна
      ipcRenderer.send(AppChannel.OPEN_DEV_WINDOW);
    }
  }

  if (GAME_SETTINGS_PATH_REGEXP.test(location.pathname)) {
    const {
      main: {
        isDeveloperMode,
        isLauncherConfigChanged,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    if (isLauncherInitialised) {
      if (
        (!isDeveloperMode && !isGameSettingsLoaded && location.state?.isFromMainPage)
        || isLauncherConfigChanged
      ) {
        yield call(initGameSettingsSaga, false);

        if (location.state?.isFromMainPage) {
          const {
            gameSettings: {
              gameSettingsGroups,
            },
          }: ReturnType<typeof getState> = yield select(getState);

          if (gameSettingsGroups.length > 0) {
            yield put(push(`${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`));
          }
        }
      } else if (isDeveloperMode && isGameSettingsLoaded && location.state?.isFromMainPage) {
        const {
          gameSettings: {
            gameSettingsFiles,
            gameSettingsParameters,
            moProfile,
          },
        }: ReturnType<typeof getState> = yield select(getState);

        const options: SagaReturnType<typeof generateGameSettingsOptionsSaga> = yield call(
          generateGameSettingsOptionsSaga,
          gameSettingsFiles,
          gameSettingsParameters,
          moProfile,
        );

        yield put(setGameSettingsOptions(options));
      } else if (location.state?.isGameSettingsOptionsChanged) {
        const {
          gameSettings: { gameSettingsOptions },
        }: ReturnType<typeof getState> = yield select(getState);

        yield put(setGameSettingsOptions(getGameSettingsOptionsWithDefaultValues(gameSettingsOptions)));
      }
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
  yield takeLatest(MAIN_TYPES.RENAME_GAME_SETTINGS_FILES_BACKUP, renameGameSettingsFilesBackupSaga);
  yield takeLatest(MAIN_TYPES.RESTORE_GAME_SETTINGS_FILES_BACKUP, restoreGameSettingsFilesBackupSaga);
  yield takeLatest(GAME_SETTINGS_TYPES.UPDATE_GAME_SETTINGS_OPTIONS, updateGameSettingsOptionsSaga);
}
