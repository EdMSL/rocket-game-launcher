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
  setIsGameSettingsLoading,
} from '$actions/main';
import {
  generateGameSettingsParametersSaga,
  initGameSettingsSaga,
} from '$sagas/gameSettings';
import {
  GAME_SETTINGS_FILE_PATH,
} from '$constants/paths';
import {
  LogMessageType, writeToLogFileSync,
} from '$utils/log';
import {
  ErrorName, getSagaErrorLogMessage, ReadWriteError, SagaError,
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
import { ILocationState, IUnwrap } from '$types/common';
import {
  setGameSettingsParameters, updateGameSettingsParameters,
} from '$actions/gameSettings';
import { getGameSettingsParametersWithNewValues } from '$utils/data';
import { GAME_SETTINGS_TYPES } from '$types/gameSettings';
import { AppChannel } from '$constants/misc';
import { getPathToFile } from '$utils/files';
import { GAME_SETTINGS_CONFIG_FILE_NAME } from '$constants/defaultData';
import { getFileNameFromPathToFile } from '$utils/strings';

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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `An error occured during launcher initialization: ${getSagaErrorLogMessage(error)};
}`,
      LogMessageType.ERROR,
    );
  } finally {
    yield put(setIsLauncherInitialised(true));
  }
}

function* updateGameSettingsParametersSaga(
  { payload: gameSetingsConfig }: ReturnType<typeof updateGameSettingsParameters>,
): SagaIterator {
  try {
    yield put(setGameSettingsParameters({}));

    yield call(initGameSettingsSaga, true, gameSetingsConfig);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    let errorMessage = '';
    let userErrorMessage = 'Возникла ошибка в процессе обновления игровых настроек. Подробности в файле лога.';// eslint-disable-line max-len

    if (
      error instanceof SagaError
      && error.reason instanceof ReadWriteError
      && error.reason.causeName === ErrorName.NOT_FOUND
    ) {
      const fileName = getFileNameFromPathToFile(error.reason.path, true);

      userErrorMessage = `Не найден файл ${fileName}, обновление прервано.${fileName === GAME_SETTINGS_CONFIG_FILE_NAME ? ' Игровые настройки будут недоступны.' : ''}`;// eslint-disable-line max-len
      errorMessage = `${error.message}. Path '${error.reason.path}'.`;

      if (fileName === GAME_SETTINGS_CONFIG_FILE_NAME) {
        yield put(push(`${Routes.MAIN_SCREEN}`));
      }
    } else {
      errorMessage = getSagaErrorLogMessage(error);
    }

    yield put(addMessages(
      [CreateUserMessage.error(userErrorMessage)],
    ));

    writeToLogFileSync(
      `An error occured during update game settings parameters: ${errorMessage}`,
      LogMessageType.ERROR,
    );
  } finally {
    yield put(setIsGameSettingsLoading(false));
  }
}

function* getGameSettingsFilesBackupSaga(isExternalCall = true): SagaIterator {
  try {
    if (isExternalCall) {
      yield put(setIsGameSettingsFilesBackuping(true));
    }

    const result: IUnwrap<typeof getGameSettingsFilesBackups> = yield call(
      getGameSettingsFilesBackups,
    );

    yield put(setGameSettingsFilesBackup(result));
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    if (isExternalCall) {
      throw new SagaError('Get game settings files backup', error.message, error);
    } else {
      writeToLogFileSync(
        `Failed to get game settings files backup. Reason: ${getSagaErrorLogMessage(error)}`,
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `Failed to create game settings files backup. Reason: ${getSagaErrorLogMessage(error)}`,
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    if (error instanceof ReadWriteError && error.causeName === ErrorName.NOT_FOUND) {
      yield put(addMessages([CreateUserMessage.warning(
        'Не удалось удалить файлы бэкапа. Папка была удалена, перемещена или переименована.',
      )]));
      yield call(getGameSettingsFilesBackupSaga, false);

      writeToLogFileSync(
        `Failed to delete game settings files backup. Reason: ${error.message}. Path '${error.path}'.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
    } else {
      writeToLogFileSync(
        `Failed to delete game settings files backup. Reason: ${getSagaErrorLogMessage(error)}`,
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
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    if (error instanceof ReadWriteError && error.causeName === ErrorName.NOT_FOUND) {
      yield put(addMessages([CreateUserMessage.warning(
        'Не удалось переименовать папку бэкапа. Папка была удалена, перемещена или переименована.',
      )]));
      yield call(getGameSettingsFilesBackupSaga, false);

      writeToLogFileSync(
        `Failed to rename game settings files backup. Reason: ${error.message}. Path '${error.path}'.`, //eslint-disable-line max-len
        LogMessageType.ERROR,
      );
    } else {
      writeToLogFileSync(
        `Failed to rename game settings files backup. Reason: ${getSagaErrorLogMessage(error)}`,
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
        gameSettingsOptions,
        moProfile,
      },
    }: ReturnType<typeof getState> = yield select(getState);

    const {
      gameSettingsParameters,
    }: SagaReturnType<typeof generateGameSettingsParametersSaga> = yield call(
      generateGameSettingsParametersSaga,
      gameSettingsFiles,
      gameSettingsOptions,
      moProfile,
    );

    yield put(setGameSettingsParameters(gameSettingsParameters));
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    writeToLogFileSync(
      `Failed to restore game settings files from backup. Reason: ${getSagaErrorLogMessage(error)}`,
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
  try {
    const {
      main: {
        isLauncherInitialised,
        isGameSettingsLoaded,
        config: { isFirstStart },
      },
    }: ReturnType<typeof getState> = yield select(getState);

    if (!isLauncherInitialised && (location.pathname === Routes.MAIN_SCREEN)) {
      yield call(initLauncherSaga);

      if (isFirstStart) {
        // Здесь должен быть action на setDevWindowOpening, перенесен в storage основного процесса
        // чтобы убрать эффект мигания окна
        ipcRenderer.send(AppChannel.CHANGE_DEV_WINDOW_STATE, true);
      }
    }

    if (GAME_SETTINGS_PATH_REGEXP.test(location.pathname)) {
      const {
        main: {
          isGameSettingsConfigChanged,
        },
      }: ReturnType<typeof getState> = yield select(getState);

      if (isLauncherInitialised) {
        if (
          (!isGameSettingsLoaded && location.state?.isFromMainPage)
          || isGameSettingsConfigChanged
        ) {
          yield call(initGameSettingsSaga);

          const {
            main: { isGameSettingsLoaded }, //eslint-disable-line @typescript-eslint/no-shadow
          }: ReturnType<typeof getState> = yield select(getState);

          if (isGameSettingsLoaded && location.state?.isFromMainPage) {
            const {
              gameSettings: {
                gameSettingsGroups,
              },
            }: ReturnType<typeof getState> = yield select(getState);

            if (gameSettingsGroups.length > 0) {
              yield put(push(`${Routes.GAME_SETTINGS_SCREEN}/${gameSettingsGroups[0].name}`));
            }
          }
        } else if (isGameSettingsLoaded && location.state?.isFromMainPage) {
          const {
            gameSettings: {
              gameSettingsFiles,
              gameSettingsOptions,
              moProfile,
            },
          }: ReturnType<typeof getState> = yield select(getState);

          const {
            gameSettingsParameters: parameters,
          }: SagaReturnType<typeof generateGameSettingsParametersSaga> = yield call(
            generateGameSettingsParametersSaga,
            gameSettingsFiles,
            gameSettingsOptions,
            moProfile,
          );

          yield put(setGameSettingsParameters(parameters));
        } else if (location.state?.isGameSettingsParametersChanged) {
          const {
            gameSettings: { gameSettingsParameters },
          }: ReturnType<typeof getState> = yield select(getState);

          yield put(setGameSettingsParameters(
            getGameSettingsParametersWithNewValues(gameSettingsParameters, false),
          ));
        }
      } else if (!isLauncherInitialised) {
        yield put(push(Routes.MAIN_SCREEN));
      }
    }
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    yield put(addMessages([CreateUserMessage.error(error.message)]));
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
  yield takeLatest(GAME_SETTINGS_TYPES.UPDATE_GAME_SETTINGS_PARAMETERS, updateGameSettingsParametersSaga);
}
