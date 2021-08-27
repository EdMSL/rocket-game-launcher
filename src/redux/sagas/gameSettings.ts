import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
} from 'redux-saga/effects';
import path from 'path';
import fs from 'fs';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import {
  readINIFile, readJSONFile, writeINIFile,
} from '$utils/files';
import { IUnwrap, IUnwrapSync } from '$types/common';
import {
  addMessages, setIsGameSettingsAvailable, setIsGameSettingsLoaded,
} from '$actions/main';
import { GAME_DIR, GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { checkUsedFiles, checkGameSettingsConfigMainFields } from '$utils/check';
import { IGameSettingsConfig } from '$types/gameSettings';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { CreateUserMessage } from '$utils/message';
import {
  setGameSettingsConfig, setGameSettingsUsedFiles, setMoProfile,
} from '$actions/gameSettings';
import { ErrorName, SagaError } from '$utils/errors';

const getState = (state: IAppState): IAppState => state;

export function* setGameSettingsSaga(): SagaIterator {
  try {
    const gameSettingsObj: IGameSettingsConfig = yield call(readJSONFile, GAME_SETTINGS_FILE_PATH);
    const {
      newUserMessages: checkingMessages,
      newSettingsConfigObj,
    } = checkGameSettingsConfigMainFields(gameSettingsObj);

    if (checkingMessages.length > 0) {
      yield put(addMessages(checkingMessages));
    }

    // Определяем, будет ли доступен раздел настроек
    const isHasErrorsInCheckingResult = checkingMessages.some(
      (currentMsg) => currentMsg.type === 'error',
    );

    if (!isHasErrorsInCheckingResult) {
      yield put(setIsGameSettingsAvailable(true));
      yield put(setGameSettingsConfig(newSettingsConfigObj));
    }

    // return gameSettingsObj;
  } catch (error) {
    yield put(addMessages([CreateUserMessage.error('Ошибка обработки файла settings.json. Игровые настройки будут недоступны. Подробности в файле лога')])); //eslint-disable-line max-len

    writeToLogFile(
      `An error occurred while processing the file settings.json. ${error.message}`,
      LogMessageType.ERROR,
    );
  }
}

function* getDataFromMOIniSaga() {
  try {
    const {
      system: {
        modOrganizer: {
          pathToINI,
          profileSection,
          profileParam,
          profileParamValueRegExp,
          isSectional,
        },
      },
    }: IAppState = yield select(getState);

    const iniData: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve(GAME_DIR, pathToINI),
    );

    // Недокументированная возможность на случай перехода инишника МО на несекционный.
    // Искать профиль через RegExp
    if (isSectional) {
      const currentMOProfileIniSection = iniData.getSection(profileSection);

      //TODO Додулать проверку с RegExp
      if (currentMOProfileIniSection) {
        const profileName = currentMOProfileIniSection.getValue(profileParam);

        if (profileName) {
          const name = profileName;
          // if (profileParamValueRegExp) {
          //   const execResult = /sdsd/.s(profileName);

          //   if (execResult?.length! > 0) {
          //     name = ...execResult[0];
          //   } else {
          //     throw new SagaError('profileParamValueRegExp');
          //   }
          // }

          yield put(setMoProfile(name.toString()));// Если вдруг будет число
        } else {
          throw new SagaError('profileName');
        }
      } else {
        throw new SagaError('profileSection');
      }
    } else {
      // Поиск если ини не секционный
    }
  } catch (error) {
    if (error.name === ErrorName.SAGA_ERROR) {
      yield put(setMoProfile(''));
      yield put(addMessages([CreateUserMessage.error(
        'Не удалось получить текущий профиль Mod Organizer. Настройки из файлов, привязанных к профилю, будут недоступны. Подробности в файле лога.', //eslint-disable-line max-len
      )]));

      writeToLogFile(
        `Can't get current Mod Organizer profile. Problem with: ${error.message}`,
        LogMessageType.ERROR,
      );
    } else {
      writeToLogFile(error.message, LogMessageType.ERROR);
    }
  }
}

function* getDataFromUsedFiles(): SagaIterator {
  try {
    const {
      gameSettings: {
        usedFiles,
      },
    }: IAppState = yield select(getState);
  } catch (error) {
    writeToLogFile(error, LogMessageType.ERROR);
  }
}

export function* initGameSettingsSaga(): SagaIterator {
  try {
    yield call(setIsGameSettingsLoaded, false);

    const {
      gameSettings: {
        usedFiles,
        baseFilesEncoding,
        settingGroups,
      },
    }: IAppState = yield select(getState);

    const { newUserMessages, newUsedFilesObj }: IUnwrapSync<typeof checkUsedFiles> = yield call(
      checkUsedFiles,
      usedFiles,
      baseFilesEncoding,
      settingGroups.length > 0,
    );

    if (newUserMessages.length > 0) {
      yield put(addMessages(newUserMessages));
    }

    yield put(setGameSettingsUsedFiles(
      Object.keys(newUsedFilesObj).length > 0 ? newUsedFilesObj : {},
    ));
  } catch (error) {
    writeToLogFileSync(error.message);
  } finally {
    yield call(setIsGameSettingsLoaded, true);
  }
}

function* locationChangeSaga({ payload: { location } }: LocationChangeAction): SagaIterator {
  if (location.hash === `#${Routes.GAME_SETTINGS_SCREEN}`) {
    yield call(initGameSettingsSaga);
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
