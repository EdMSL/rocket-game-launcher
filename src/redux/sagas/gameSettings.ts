import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  takeLatest,
  select,
  all,
} from 'redux-saga/effects';
import path from 'path';
import fs from 'fs';
import { LOCATION_CHANGE, LocationChangeAction } from 'connected-react-router';

import { IAppState } from '$store/store';
import { Routes } from '$constants/routes';
import {
  getPathToFile,
  IIniObj,
  readDirectory,
  readFileForGameOptions,
  readINIFile,
  readJSONFile,
} from '$utils/files';
import { IUnwrap, IUnwrapSync } from '$types/common';
import {
  addMessages, setIsGameSettingsAvailable, setIsGameSettingsLoaded,
} from '$actions/main';
import { GAME_DIR, GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { checkUsedFiles, checkGameSettingsConfigMainFields } from '$utils/check';
import { IGameSettingsConfig, IGameSettingsOptions } from '$types/gameSettings';
import {
  LogMessageType, writeToLogFile, writeToLogFileSync,
} from '$utils/log';
import { CreateUserMessage, IMessage } from '$utils/message';
import {
  setGameSettingsConfig, setGameSettingsOptions, setGameSettingsUsedFiles, setMoProfile, setMoProfiles,
} from '$actions/gameSettings';
import {
  CustomError,
  ReadWriteError,
  SagaError,
} from '$utils/errors';
import { getOptionData } from '$utils/data';
import { IUserMessage } from '$types/main';

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
    } else {
      yield put(setIsGameSettingsAvailable(true));
      yield put(setGameSettingsConfig(newSettingsConfigObj));
    }
  } catch (error) {
    yield put(addMessages([CreateUserMessage.error('Ошибка обработки файла settings.json. Игровые настройки будут недоступны. Подробности в файле лога')])); //eslint-disable-line max-len

    writeToLogFile(
      `An error occurred while processing the file settings.json. ${error.message}`,
      LogMessageType.ERROR,
    );
  }
}

function* getMOProfilesSaga(): SagaIterator {
  const {
    system: {
      modOrganizer: {
        pathToProfiles,
      },
    },
  }: IAppState = yield select(getState);

  const profilesPath = path.resolve(GAME_DIR, pathToProfiles);

  try {
    const profiles: IUnwrap<typeof readDirectory> = yield call(
      readDirectory,
      profilesPath,
    );

    if (profiles.length > 0) {
      yield put(setMoProfiles(profiles));
    } else {
      throw new CustomError('There are no profiles in the profiles folder.');
    }
  } catch (error) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${profilesPath}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    yield put(addMessages([CreateUserMessage.error(
      'Ошибка при попытке получения профилей Mod Organizer. Настройки из файлов, привязанных к профилю, будут недоступны. Подробности в файле лога.', //eslint-disable-line max-len
    )]));

    throw new SagaError('Get Mod Organizer profiles', errorMessage);
  }
}

function* getDataFromMOIniSaga(): SagaIterator {
  try {
    const {
      system: {
        modOrganizer: {
          pathToINI,
          profileSection,
          profileParam,
          profileParamValueRegExp,
        },
      },
    }: IAppState = yield select(getState);

    const iniData: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve(GAME_DIR, pathToINI),
    );

    const currentMOProfileIniSection = iniData.getSection(profileSection);

    //TODO Возможно имеет смысл перейти на зависимость от версии МО
    if (currentMOProfileIniSection) {
      const profileName = currentMOProfileIniSection.getValue(profileParam);

      if (profileName) {
        let name = profileName;

        if (profileParamValueRegExp) {
          const result = profileName.match(new RegExp(profileParamValueRegExp)) || [];

          if (result.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            name = result[1];
          } else {
            throw new CustomError('profileParamValueRegExp');
          }
        }

        yield put(setMoProfile(name.toString()));// Если вдруг будет число
      } else {
        throw new CustomError('profileName');
      }
    } else {
      throw new CustomError('profileSection');
    }
  } catch (error) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      yield put(setMoProfile(''));

      errorMessage = `Can't get current Mod Organizer profile. Problem with: ${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    yield put(addMessages([CreateUserMessage.error(
      'Не удалось получить текущий профиль Mod Organizer. Настройки из файлов, привязанных к профилю, будут недоступны. Подробности в файле лога.', //eslint-disable-line max-len
    )]));

    throw new SagaError('Get data from Mod Organizer INI file', errorMessage);
  }
}

function* getDataFromUsedFiles(): SagaIterator {
  try {
    const {
      gameSettings: {
        usedFiles,
        moProfile,
      },
      system: {
        customPaths,
      },
    }: IAppState = yield select(getState);

    const currentFilesData: IUnwrap<typeof readFileForGameOptions>[] = yield all(
      Object.keys(usedFiles).map((fileName) => call(
        readFileForGameOptions,
        getPathToFile(usedFiles[fileName].path, customPaths, moProfile),
        fileName,
      )),
    );

    const currentFilesDataObj = currentFilesData.reduce<{ [key: string]: IIniObj, }>(
      (filesData, currentFile) => ({
        ...filesData,
        [currentFile.name]: currentFile.fileData,
      }),
      {},
    );

    let optionsErrors: IUserMessage[] = [];

    const totalGameOptions: IGameSettingsOptions = Object.keys(usedFiles).reduce(
      (gameOptions, currentUsedFile) => {
        const optionsFromFile = usedFiles[currentUsedFile].parameters.reduce(
          (currentOptions, currentParameter) => {
            const {
              paramName, paramValue, paramErrors,
            } = getOptionData(
              currentFilesDataObj[currentUsedFile],
              currentParameter,
              usedFiles[currentUsedFile].view,
              currentUsedFile,
              path.basename(usedFiles[currentUsedFile].path),
              moProfile,
            );

            if (paramErrors.length > 0) {
              optionsErrors = [...optionsErrors, ...paramErrors];

              return { ...currentOptions };
            }

            return {
              ...currentOptions,
              [paramName]: {
                default: paramValue,
                value: paramValue,
                settingsGroup: currentParameter.settingGroup,
                parent: currentUsedFile,
              },
            };
          },
          {},
        );

        if (Object.keys(optionsFromFile).length > 0) {
          return {
            ...gameOptions,
            [currentUsedFile]: optionsFromFile,
          };
        }

        return {
          ...gameOptions,
        };
      },
      {},
    );

    if (optionsErrors.length > 0) {
      yield put(addMessages(optionsErrors));
    }

    if (Object.keys(totalGameOptions).length > 0) {
      yield put(setGameSettingsOptions(totalGameOptions));
    } else {
      yield put(addMessages([CreateUserMessage.error('Нет доступных настроек для вывода.')]));

      throw new CustomError('No game options to show.');
    }
  } catch (error) {
    throw new SagaError('Get data from used files', error.message);
  }
}

export function* initGameSettingsSaga(): SagaIterator {
  try {
    yield call(setIsGameSettingsLoaded, false);
    writeToLogFileSync('Start game settings initialisation.');

    const {
      gameSettings: {
        usedFiles,
        baseFilesEncoding,
        settingGroups,
      },
      system: {
        modOrganizer: {
          isUsed: isMOUsed,
        },
      },
    }: IAppState = yield select(getState);

    if (isMOUsed) {
      yield call(getMOProfilesSaga);
      yield call(getDataFromMOIniSaga);
    }

    const { newUserMessages, newUsedFilesObj }: IUnwrapSync<typeof checkUsedFiles> = yield call(
      checkUsedFiles,
      usedFiles,
      baseFilesEncoding,
      settingGroups,
    );

    if (newUserMessages.length > 0) {
      yield put(addMessages(newUserMessages));
    }

    yield put(setGameSettingsUsedFiles(
      Object.keys(newUsedFilesObj).length > 0 ? newUsedFilesObj : {},
    ));

    yield call(getDataFromUsedFiles);

    writeToLogFileSync('Game settings initialisation completed.');
  } catch (error) {
    let errorMessage = '';

    if (error instanceof SagaError) {
      errorMessage = `An error occured during ${error.sagaName}. ${error.message}`;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    writeToLogFileSync(
      `Game settings initialization failed. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );
  } finally {
    yield call(setIsGameSettingsLoaded, true);
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  // yield takeLatest(LOCATION_CHANGE, locationChangeSaga);
}
