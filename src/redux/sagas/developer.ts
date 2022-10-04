import {
  LOCATION_CHANGE, LocationChangeAction, push,
} from 'connected-react-router';
import { SagaIterator } from 'redux-saga';
import {
  call, put, SagaReturnType, select, takeLatest,
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
  ErrorName, getSagaErrorLogMessage, ReadWriteError, SagaError,
} from '$utils/errors';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { getGameSettingsConfigSaga } from './gameSettings';
import { DEVELOPER_TYPES } from '$types/developer';
import {
  AppChannel, AppWindowName, PathRegExp, PathVariableName,
} from '$constants/misc';
import {
  getIsExists, getJoinedPath, normalizePath, writeJSONFile,
} from '$utils/files';
import {
  CONFIG_FILE_PATH, GAME_SETTINGS_FILE_PATH, IPathVariables,
} from '$constants/paths';
import {
  deepClone,
  getGameSettingsElementsNames,
  getModOrganizerPathVariables,
  updatePathVariables,
  getWindowSettingsFromLauncherConfig,
} from '$utils/data';
import {
  checkObjectForEqual,
} from '$utils/check';
import {
  defaultGameSettingsConfig, GAME_SETTINGS_CONFIG_FILE_NAME, MO_INI_FILE_NAME,
} from '$constants/defaultData';
import {
  getFileNameFromPathToFile, getObjectAsList, replacePathVariableByRootDir,
} from '$utils/strings';
import { ILauncherConfig } from '$types/main';
import { GameSettingsOptionFields, IGameSettingsConfig } from '$types/gameSettings';

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

    let {
      data: settingsConfig,
      errors, //eslint-disable-line prefer-const
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
        const MO_DIR_BASE = replacePathVariableByRootDir(settingsConfig.modOrganizer.pathToMOFolder);

        if (getIsExists(getJoinedPath(MO_DIR_BASE, MO_INI_FILE_NAME))) {
          const MOPathVariables = getModOrganizerPathVariables(
            MO_DIR_BASE,
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
        } else {
          const changedFileNames: string[] = [];
          const changedOptionsNames: string[] = [];

          const newFiles = settingsConfig.gameSettingsFiles.filter(
            (currentFile) => {
              if (PathRegExp.MO.test(currentFile.path)) {
                changedFileNames.push(currentFile.label);

                return false;
              }

              return true;
            },
          );
          const filesNames = getGameSettingsElementsNames(newFiles);

          settingsConfig = {
            ...settingsConfig,
            gameSettingsFiles: newFiles,
            gameSettingsOptions: settingsConfig.gameSettingsOptions.filter(
              (currentOption) => {
                if (!filesNames.includes(currentOption.file)) {
                  changedOptionsNames.push(currentOption.label);

                  return false;
                }

                return true;
              },
            ),
            modOrganizer: {
              ...settingsConfig.modOrganizer,
              isUsed: false,
            },
          };

          yield put(addDeveloperMessages([CreateUserMessage.warning(`Включено использование Mod Organizer, но файл ${MO_INI_FILE_NAME} не найден.${changedFileNames.length > 0 ? ` Файлы [${changedFileNames.join()}]${`${changedOptionsNames.length > 0 ? ` и опции [${changedOptionsNames.join()}]` : ''}`} будут проигнорированы, т.к. в них используются переменные Mod Organizer` : ''}`)]));//eslint-disable-line max-len
        }
      }
    }

    if (errors.length > 0) {
      yield put(addDeveloperMessages([CreateUserMessage.warning(`Обнаружены ошибки в файле ${GAME_SETTINGS_CONFIG_FILE_NAME}. Подробности в файле лога.`)]));//eslint-disable-line max-len
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
    let userErrorMessage = `В процессе получения игровых настроек возникла ошибка.${isFromUpdateAction ? ' Обновление прервано.' : ''} Подробности в файле лога.`; //eslint-disable-line max-len
    let errorMessage = '';
    let isWarning = false;

    if (
      error instanceof SagaError
      && error.reason instanceof ReadWriteError
      && error.reason.causeName === ErrorName.NOT_FOUND
    ) {
      if (isFromUpdateAction) {
        errorMessage = `Game settings file "${GAME_SETTINGS_CONFIG_FILE_NAME}" not found. Update aborted.`;//eslint-disable-line max-len
        userErrorMessage = `Не найден файл "${GAME_SETTINGS_CONFIG_FILE_NAME}". Обновление прервано.`;//eslint-disable-line max-len
      } else {
        isWarning = true;
        errorMessage = `Game settings file "${GAME_SETTINGS_CONFIG_FILE_NAME}" not found.`;
        userErrorMessage = '';
      }
    } else { errorMessage = getSagaErrorLogMessage(error); }
    writeToLogFile(errorMessage, isWarning ? LogMessageType.WARNING : LogMessageType.ERROR);

    if (userErrorMessage) {
      yield put(addDeveloperMessages([CreateUserMessage.error(userErrorMessage)]));
    }

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

  try {
    yield call(
      writeJSONFile,
      CONFIG_FILE_PATH,
      deepClone(newConfig, [GameSettingsOptionFields.ID]),
    );

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
    writeToLogFileSync(
      `Failed to save launcher configuration file. Reason: ${getSagaErrorLogMessage(error)}`,
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
      deepClone(
        newConfig,
        [GameSettingsOptionFields.ID, GameSettingsOptionFields.SELECT_OPTIONS_VALUE_STRING],
      ),
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
    writeToLogFileSync(
      `Failed to save game settings file. Reason: ${getSagaErrorLogMessage(error)}`,
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
    writeToLogFileSync(
      `Failed to create game settings file. Reason: ${getSagaErrorLogMessage(error)}`,
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
