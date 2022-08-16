import {
  LOCATION_CHANGE, LocationChangeAction, push,
} from 'connected-react-router';
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
  saveConfiguration,
  setGameSettingsConfig,
  setIsGameSettingsConfigFileExists,
  setisGameSettingsConfigDataLoaded,
  setIsConfigProcessing,
  setLauncherConfig,
  setPathVariablesDeveloper,
  updateConfig,
} from '$actions/developer';
import { DeveloperScreenName, Routes } from '$constants/routes';
import { CreateUserMessage } from '$utils/message';
import {
  CustomError, ErrorName, ReadWriteError, SagaError,
} from '$utils/errors';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { getGameSettingsConfigSaga } from './gameSettings';
import { DEVELOPER_TYPES } from '$types/developer';
import {
  AppChannel, AppWindowName, PathVariableName,
} from '$constants/misc';
import { normalizePath, writeJSONFile } from '$utils/files';
import {
  CONFIG_FILE_PATH, GAME_SETTINGS_FILE_PATH, IPathVariables,
} from '$constants/paths';
import {
  deepClone, getModOrganizerPathVariables, updatePathVariables,
} from '$utils/data';
import {
  checkObjectForEqual, getWindowSizeSettingsFromLauncherConfig,
} from '$utils/check';
import { defaultGameSettingsConfig } from '$constants/defaultData';
import {
  getFileNameFromPathToFile, getObjectAsList, replacePathVariableByRootDir,
} from '$utils/strings';
import { ILauncherConfig } from '$types/main';
import { IGameSettingsConfig } from '$types/gameSettings';

const getState = (state: IDeveloperState): IDeveloperState => state;

/**
 * Инициализация игровых настроек для режима разработчика.
 * Только проверка полей на валидность и запись в `state`.
 */
export function* initGameSettingsDeveloperSaga(isFromUpdateAction = false): SagaIterator {
  if (isFromUpdateAction) {
    writeToLogFileSync('Update game settings from developer screen.');
  }

  yield call(
    ipcRenderer.send,
    AppChannel.SAVE_DEV_CONFIG,
    true,
  );

  try {
    yield put(setIsConfigProcessing(true));

    const {
      data: settingsConfig,
      errors,
    }: SagaReturnType<typeof getGameSettingsConfigSaga> = yield call(
      getGameSettingsConfigSaga,
      AppWindowName.DEV,
    );

    let newPathVariables: IPathVariables;

    if (settingsConfig.modOrganizer.isUsed
      || settingsConfig.documentsPath !== PathVariableName.DOCUMENTS) {
      const {
        developer: {
          pathVariables,
        },
      }: ReturnType<typeof getState> = yield select(getState);

      newPathVariables = { ...pathVariables };

      if (settingsConfig.documentsPath !== PathVariableName.DOCUMENTS) {
        newPathVariables = {
          ...newPathVariables,
          [PathVariableName.DOCS_GAME]: replacePathVariableByRootDir(
            normalizePath(settingsConfig.documentsPath),
            PathVariableName.DOCUMENTS,
            pathVariables['%DOCUMENTS%'],
          ),
        };
      }

      if (settingsConfig.modOrganizer.isUsed) {
        const MOPathVariables = getModOrganizerPathVariables(
          settingsConfig.modOrganizer.pathToMOFolder,
          pathVariables,
        );

        newPathVariables = {
          ...newPathVariables,
          ...MOPathVariables,
        };

        yield put(setPathVariablesDeveloper(newPathVariables));

        if (!isFromUpdateAction) {
          writeToLogFile(`Mod Organizer paths variables:\n  ${getObjectAsList(MOPathVariables, true, true)}`); //eslint-disable-line max-len
        }
      }
    }

    if (errors.length > 0) {
      yield put(addDeveloperMessages([CreateUserMessage.warning('Обнаружены ошибки в файле settings.json. Подробности в файле лога.')]));//eslint-disable-line max-len
    }

    yield put(setGameSettingsConfig(settingsConfig));
    yield put(setisGameSettingsConfigDataLoaded(true));
    yield call(ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      undefined,
      settingsConfig,
      false,
      // Игнорируем возможную передачу undefined, т.к. это предусмотрено функцией.
      //@ts-ignore
      newPathVariables);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    let errorMessage = '';
    let isWarning = false;

    if (
      error instanceof SagaError
      && error.reason instanceof ReadWriteError
      && error.reason.causeName === ErrorName.NOT_FOUND
    ) {
      isWarning = true;
      errorMessage = 'Game settings file "settings.json" not found.';
    } else if (error instanceof SagaError) {
      errorMessage = `Error in "${error.sagaName}". ${error.message}`;
    } else if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path "${error.path}".`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFile(errorMessage, isWarning ? LogMessageType.WARNING : LogMessageType.ERROR);

    yield put(setisGameSettingsConfigDataLoaded(false));
  } finally {
    yield put(setIsConfigProcessing(false));
    yield call(
      ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      false,
    );
  }
}

function* updateConfigSaga({ payload: configName }: ReturnType<typeof updateConfig>): SagaIterator {
  if (configName === DeveloperScreenName.GAME_SETTINGS) {
    yield call(initGameSettingsDeveloperSaga, true);
  }
}

function* saveLauncherConfigSaga(
  newConfig: ILauncherConfig, pathToGo: string,
): SagaIterator {
  // Ставим здесь именно сохранение игровых настроек только из-за показа лоадера
  yield put(setIsConfigProcessing(true));
  yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, true);
  yield delay(2000);

  try {
    yield call(writeJSONFile, CONFIG_FILE_PATH, deepClone(newConfig, ['id']));

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
      getWindowSizeSettingsFromLauncherConfig(launcherConfig),
      getWindowSizeSettingsFromLauncherConfig(newConfig),
    );

    yield call(ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      false,
      newConfig,
      true,
      newPathVariables,
      isChangeWindowSize);

    yield put(setLauncherConfig(newConfig));
    yield put(setPathVariablesDeveloper(newPathVariables));

    if (!checkObjectForEqual(pathVariables, newPathVariables)) {
      writeToLogFile(`Paths variables updated:\n  ${getObjectAsList(newPathVariables, true, true)}`); //eslint-disable-line max-len
    }

    if (pathToGo) {
      if (pathToGo === Routes.MAIN_SCREEN) {
        yield call(ipcRenderer.send, AppChannel.CHANGE_DEV_WINDOW_STATE, false);
      } else {
        yield put(push(pathToGo));
      }
    }
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
    yield put(setIsConfigProcessing(false));
    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, false);
  }
}

function* saveGameSettingsConfigSaga(
  newConfig: IGameSettingsConfig, pathToGo: string,
): SagaIterator {
  yield put(setIsConfigProcessing(true));
  yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, true);
  yield delay(2000);
  try {
    if (!newConfig.baseFilesEncoding) {
      newConfig.baseFilesEncoding = defaultGameSettingsConfig.baseFilesEncoding; //eslint-disable-line no-param-reassign, max-len
    }

    if (newConfig.gameSettingsFiles.some((file) => !file.label)) {
      newConfig.gameSettingsFiles = newConfig.gameSettingsFiles.map((file) => { //eslint-disable-line no-param-reassign, max-len
        if (!file.label) {
          return {
            ...file,
            label: getFileNameFromPathToFile(file.path),
          };
        }

        return file;
      });
    }

    yield call(
      writeJSONFile,
      GAME_SETTINGS_FILE_PATH,
      deepClone(newConfig, ['id', 'selectOptionsValueString']),
    );

    const {
      developer: {
        pathVariables,
        gameSettingsConfig: { modOrganizer: { pathToMOFolder, isUsed }, documentsPath },
      },
    }: ReturnType<typeof getState> = yield select(getState);

    if ((newConfig.modOrganizer.isUsed
      && (pathToMOFolder !== newConfig.modOrganizer.pathToMOFolder || !isUsed))
      || documentsPath !== newConfig.documentsPath
    ) {
      const newPathVariables = updatePathVariables(
        pathVariables,
        newConfig,
      );

      yield put(setPathVariablesDeveloper(newPathVariables));

      writeToLogFile(`Paths variables updated:\n  ${getObjectAsList(newPathVariables, true, true)}`); //eslint-disable-line max-len
    }

    yield put(setGameSettingsConfig(newConfig));

    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, false, newConfig, true);

    if (pathToGo) {
      if (pathToGo === Routes.MAIN_SCREEN) {
        yield call(ipcRenderer.send, AppChannel.CHANGE_DEV_WINDOW_STATE, false);
      } else {
        yield put(push(pathToGo));
      }
    }
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
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
    yield put(setIsConfigProcessing(false));
  }
}

function* saveConfigurationSaga(
  { payload: { newConfig, pathToGo } }: ReturnType<typeof saveConfiguration>,
): SagaIterator {
  if ('playButton' in newConfig) {
    yield call(saveLauncherConfigSaga, newConfig, pathToGo);
  } else if ('baseFilesEncoding' in newConfig) {
    yield call(saveGameSettingsConfigSaga, newConfig, pathToGo);
  }
}

function* createGameSettingsConfigFileSaga(): SagaIterator {
  yield put(setIsConfigProcessing(true));

  try {
    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, true);

    yield call(writeJSONFile, GAME_SETTINGS_FILE_PATH, defaultGameSettingsConfig);
    yield put(setGameSettingsConfig(defaultGameSettingsConfig));
    yield put(setisGameSettingsConfigDataLoaded(true));
    yield put(setIsGameSettingsConfigFileExists(true));

    yield call(ipcRenderer.send,
      AppChannel.SAVE_DEV_CONFIG,
      undefined,
      defaultGameSettingsConfig,
      true);
  } catch (error: any) { //eslint-disable-line @typescript-eslint/no-explicit-any
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = `${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Failed to create game settings file. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addDeveloperMessages([CreateUserMessage.error('Произошла ошибка при создании файла игровых настроек. Подробности в файле лога.')])); //eslint-disable-line max-len
  } finally {
    yield put(setIsConfigProcessing(false));
    yield call(ipcRenderer.send, AppChannel.SAVE_DEV_CONFIG, false);
  }
}

function* locationChangeSaga(
  { payload: { location } }: LocationChangeAction<ILocationState>,
): SagaIterator {
  const {
    developer: {
      isGameSettingsConfigDataLoaded,
    },
  }: ReturnType<typeof getState> = yield select(getState);

  if (
    location.pathname === Routes.DEVELOPER_SCREEN_GAME_SETTINGS
    && !isGameSettingsConfigDataLoaded
  ) {
    yield call(initGameSettingsDeveloperSaga);
  }
}

/* eslint-disable max-len */
export default function* developerSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
  yield takeLatest(DEVELOPER_TYPES.UPDATE_CONFIG, updateConfigSaga);
  yield takeLatest(DEVELOPER_TYPES.SAVE_CONFIGURATION, saveConfigurationSaga);
  yield takeLatest(DEVELOPER_TYPES.CREATE_GAME_SETTINGS_CONFIG_FILE, createGameSettingsConfigFileSaga);
}
