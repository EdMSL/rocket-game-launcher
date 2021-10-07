import { SagaIterator } from 'redux-saga';
import {
  call,
  put,
  take,
  takeLatest,
  select,
  all,
} from 'redux-saga/effects';
import path from 'path';

import { IAppState } from '$store/store';
import {
  IIniObj,
  IXmlObj,
  readDirectory,
  readFileForGameSettingsOptions,
  readINIFile,
  readJSONFile,
  writeGameSettingsFile,
  writeINIFile,
  xmlAttributePrefix,
} from '$utils/files';
import { IUnwrap, IUnwrapSync } from '$types/common';
import {
  addMessages,
  setIsGameSettingsAvailable,
  setIsGameSettingsLoaded,
  setIsGameSettingsSaving,
} from '$actions/main';
import { GAME_DIR, GAME_SETTINGS_FILE_PATH } from '$constants/paths';
import { checkGameSettingsFiles, checkGameSettingsConfigMainFields } from '$utils/check';
import {
  GAME_SETTINGS_TYPES,
  IGameSettingsConfig,
  IGameSettingsFiles,
  IGameSettingsOptions,
  IGameSettingsOptionsItem,
} from '$types/gameSettings';
import {
  LogMessageType,
  writeToLogFile,
  writeToLogFileSync,
} from '$utils/log';
import { CreateUserMessage } from '$utils/message';
import {
  changeMoProfile,
  setGameSettingsConfig,
  setGameSettingsOptions,
  setGameSettingsFiles,
  setMoProfile,
  setMoProfiles,
  saveGameSettingsFiles,
} from '$actions/gameSettings';
import {
  CustomError,
  ReadWriteError,
  SagaError,
} from '$utils/errors';
import {
  changeSectionalIniParameter,
  filterIncorrectGameSettingsFiles,
  getGameSettingsOptionsWithDefaultValues,
  getOptionData,
  isDataFromIniFile,
  setValueForObjectDeepKey,
} from '$utils/data';
import { IUserMessage } from '$types/main';
import {
  CustomPathName,
  Encoding,
  GameSettingsOptionType,
  GameSettingsFileView,
} from '$constants/misc';
import {
  getParameterRegExp,
  getPathToFile,
  getStringPartFromIniLineParameterForReplace,
} from '$utils/strings';

interface IGetDataFromFilesResult {
  [key: string]: IIniObj|IXmlObj,
}

export interface IIncorrectGameSettingsFiles {
  [key: string]: number[],
}

export interface IGenerateGameSettingsOptionsResult {
  totalGameSettingsOptions: IGameSettingsOptions,
  incorrectGameSettingsFiles: IIncorrectGameSettingsFiles,
}

const getState = (state: IAppState): IAppState => state;

/**
 * Получить данные из файла конфигурации лаунчера
 * config.json, проверить основные поля и записать в `state`
*/
export function* setInitialGameSettingsConfigSaga(isFromUpdateAction = false): SagaIterator {
  try {
    const gameSettingsObj: IGameSettingsConfig = yield call(readJSONFile, GAME_SETTINGS_FILE_PATH);
    const newSettingsConfigObj = checkGameSettingsConfigMainFields(gameSettingsObj);

    yield put(setGameSettingsConfig(newSettingsConfigObj));
    yield put(setIsGameSettingsAvailable(true));
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path: '${error.path}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    if (!isFromUpdateAction) {
      yield put(addMessages([CreateUserMessage.error('Ошибка обработки файла settings.json. Игровые настройки будут недоступны. Подробности в файле лога')])); //eslint-disable-line max-len
    }

    throw new SagaError('Set initial game settings saga', errorMessage, error);
  }
}

/**
 * Получить список профилей Mod Organizer и записать в `state`
*/
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
  } catch (error: any) {
    let errorMessage = '';

    if (error instanceof CustomError) {
      errorMessage = error.message;
    } else if (error instanceof ReadWriteError) {
      errorMessage = `${error.message}. Path '${profilesPath}'.`;
    } else {
      errorMessage = `Unknown error. Message: ${error.message}`;
    }

    throw new SagaError('Get Mod Organizer profiles', errorMessage);
  }
}

/**
 * Получить данные из файла ModOrganizer.ini и записать нужные параметры в `state`
 * @returns Строка с профилем ModOrganizer
*/
function* getDataFromMOIniSaga(): SagaIterator<string> {
  try {
    const {
      system: {
        modOrganizer: {
          version,
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

    if (currentMOProfileIniSection) {
      const profileName = currentMOProfileIniSection.getValue(profileParam);

      if (profileName) {
        ///TODO Обработать случай для кастомного regexp
        if (profileParamValueRegExp) {
          const result = profileName.match(new RegExp(profileParamValueRegExp)) || [];

          if (result.length > 0) {
            // eslint-disable-next-line prefer-destructuring
            return result[1];
          }

          throw new CustomError('profileParamValueRegExp');
        }

        if (version === 1) {
          return profileName.toString();
        }

        if (version === 2) {
          return profileName.match(/@ByteArray\((.+)\)/)![1];
        }

        return profileName.toString();
      }

      throw new CustomError('profileName');
    } else {
      throw new CustomError('profileSection');
    }
  } catch (error: any) {
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

/**
 * Считывает данные из файлов для генерации игровых опций
 * @param filesForRead Игровые файлы, из которых нужно получить данные.
 * @param isWithPrefix Нужно ли добавлять префикс к именам атрибутов. По умолчанию `false`.
*/
function* getDataFromGameSettingsFilesSaga(
  filesForRead: IGameSettingsFiles,
  moProfile: string,
  isWithPrefix = false,
): SagaIterator<IGetDataFromFilesResult> {
  try {
    const {
      system: { customPaths },
    }: IAppState = yield select(getState);

    const currentFilesData: IUnwrap<typeof readFileForGameSettingsOptions>[] = yield all(
      Object.keys(filesForRead).map((fileName) => call(
        readFileForGameSettingsOptions,
        getPathToFile(filesForRead[fileName].path, customPaths, moProfile),
        filesForRead[fileName].view,
        fileName,
        filesForRead[fileName].encoding,
        isWithPrefix,
      )),
    );

    return currentFilesData.reduce<IGetDataFromFilesResult>(
      (filesData, currentFile) => ({
        ...filesData,
        ...currentFile,
      }),
      {},
    );
  } catch (error: any) {
    throw new SagaError('Get data from game settings files', error.message);
  }
}

/**
 * Генерирует список игровых опций на основе параметров
 * (`gameSettingsFiles`) из файлов, указанных в settings.json
 * @param gameSettingsFiles Объект-основа для генерации опций.
 * @param moProfile Профиль Mod Organizer.
*/
export function* generateGameSettingsOptionsSaga(
  gameSettingsFiles: IGameSettingsFiles,
  moProfile: string,
): SagaIterator<IGenerateGameSettingsOptionsResult> {
  try {
    let incorrectGameSettingsFiles: IIncorrectGameSettingsFiles = {};
    let optionsErrors: IUserMessage[] = [];

    const currentFilesDataObj: IUnwrap<IGetDataFromFilesResult> = yield call(
      getDataFromGameSettingsFilesSaga,
      gameSettingsFiles,
      moProfile,
    );

    const totalGameSettingsOptions: IGameSettingsOptions = Object.keys(gameSettingsFiles).reduce(
      (gameSettingsOptions, currentGameSettingsFileName) => {
        const incorrectIndexes: number[] = [];
        const currentGameSettingsFile = gameSettingsFiles[currentGameSettingsFileName];

        const optionsFromFile = currentGameSettingsFile.optionsList.reduce<IGameSettingsOptionsItem>(
          (currentOptions, currentParameter, index) => {
            //Если опция с типом group или related,
            // то генерация производится для каждого параметра в items.
            if (
              currentParameter.optionType === GameSettingsOptionType.RELATED
              || currentParameter.optionType === GameSettingsOptionType.GROUP
              || currentParameter.optionType === GameSettingsOptionType.COMBINED
            ) {
              let specParamsErrors: IUserMessage[] = [];

              const optionsFromParameter = currentParameter.items!.reduce<IGameSettingsOptionsItem>(
                (options, currentOption) => {
                  const {
                    optionName, optionValue, optionErrors,
                  } = getOptionData(
                    currentFilesDataObj[currentGameSettingsFileName],
                    currentOption,
                    currentGameSettingsFile.view,
                    currentGameSettingsFileName,
                    path.basename(currentGameSettingsFile.path),
                    moProfile,
                  );

                  if (optionErrors.length > 0) {
                    specParamsErrors = [...optionErrors];
                    incorrectIndexes.push(index);

                    return { ...options };
                  }

                  return {
                    ...options,
                    [optionName]: {
                      default: optionValue,
                      value: optionValue,
                      parent: currentGameSettingsFileName,
                    },
                  };
                },
                {},
              );

              if (specParamsErrors.length > 0) {
                optionsErrors = [...optionsErrors, ...specParamsErrors];

                return { ...currentOptions };
              }

              return {
                ...currentOptions,
                ...optionsFromParameter,
              };
            }

            const {
              optionName, optionValue, optionErrors,
            } = getOptionData(
              currentFilesDataObj[currentGameSettingsFileName],
              currentParameter,
              currentGameSettingsFile.view,
              currentGameSettingsFileName,
              path.basename(currentGameSettingsFile.path),
              moProfile,
            );

            if (optionErrors.length > 0) {
              optionsErrors = [...optionsErrors, ...optionErrors];
              incorrectIndexes.push(index);

              return { ...currentOptions };
            }

            return {
              ...currentOptions,
              [optionName]: {
                default: optionValue,
                value: optionValue,
                parent: currentGameSettingsFileName,
              },
            };
          },
          {},
        );

        if (incorrectIndexes.length > 0) {
          incorrectGameSettingsFiles = {
            ...incorrectGameSettingsFiles,
            [currentGameSettingsFileName]: incorrectIndexes,
          };
        }

        if (Object.keys(optionsFromFile).length > 0) {
          return {
            ...gameSettingsOptions,
            [currentGameSettingsFileName]: optionsFromFile,
          };
        }

        return {
          ...gameSettingsOptions,
        };
      },
      {},
    );

    if (optionsErrors.length > 0) {
      optionsErrors.forEach((message) => {
        writeToLogFile(message.text, message.type);
      });
    }

    return {
      totalGameSettingsOptions,
      incorrectGameSettingsFiles,
    };
  } catch (error: any) {
    throw new SagaError('Generate game settings options', error.message);
  }
}

/**
 * Инициализация игровых настроек. Осуществляется при первом переходе на экран настроек.
 * Получаем данные МО, проверяем на валидность параметры игровых настроек (`gameSettingsFiles`)
 * и переписываем их в случае невалидности некоторых полей, генерируем опции игровых настроек.
*/
export function* initGameSettingsSaga(isFromUpdateAction = false): SagaIterator {
  try {
    yield put(setIsGameSettingsLoaded(false));
    writeToLogFileSync('Game settings initialization started.');

    const {
      gameSettings: {
        gameSettingsFiles,
        baseFilesEncoding,
        gameSettingsGroups,
      },
      system: {
        modOrganizer: {
          isUsed: isMOUsed,
        },
      },
    }: IAppState = yield select(getState);

    let moProfile: string = '';

    if (isMOUsed) {
      yield call(getMOProfilesSaga);

      moProfile = yield call(getDataFromMOIniSaga);
      yield put(setMoProfile(moProfile));
    }

    let {
      files: newGameSettingsFilesObj,
      isError: isCheckFilesError, // eslint-disable-line prefer-const
    }: IUnwrapSync<typeof checkGameSettingsFiles> = yield call(
      checkGameSettingsFiles,
      gameSettingsFiles,
      baseFilesEncoding,
      gameSettingsGroups,
    );

    const {
      totalGameSettingsOptions,
      incorrectGameSettingsFiles,
    }: IUnwrap<IGenerateGameSettingsOptionsResult> = yield call(
      generateGameSettingsOptionsSaga,
      newGameSettingsFilesObj,
      moProfile,
    );

    newGameSettingsFilesObj = filterIncorrectGameSettingsFiles(
      newGameSettingsFilesObj,
      incorrectGameSettingsFiles,
    );

    if (Object.keys(totalGameSettingsOptions).length === 0) {
      yield put(addMessages([CreateUserMessage.error('Нет доступных настроек для вывода. Подробности в файле лога.')])); //eslint-disable-line max-len
    } else if (
      Object.keys(newGameSettingsFilesObj).length !== Object.keys(gameSettingsFiles).length
      || Object.keys(incorrectGameSettingsFiles).length > 0
      || isCheckFilesError
    ) {
      yield put(addMessages([CreateUserMessage.warning('Обнаружены ошибки в файле игровых настроек settings.json. Некоторые опции будут недоступны. Подробности в файле лога.')])); //eslint-disable-line max-len
    }

    yield put(setGameSettingsOptions(totalGameSettingsOptions));
    yield put(setGameSettingsFiles(newGameSettingsFilesObj));

    writeToLogFileSync('Game settings initialisation completed.');
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

    if (!isFromUpdateAction) {
      writeToLogFileSync(
        `Failed to initialize game settings. Reason: ${errorMessage}`,
        LogMessageType.ERROR,
      );

      yield put(addMessages([CreateUserMessage.error('Произошла ошибка в процессе генерации игровых настроек. Подробности в файле лога.')]));//eslint-disable-line max-len
    }

    yield put(setGameSettingsOptions({}));
    yield put(setGameSettingsFiles({}));

    throw new SagaError('Init game settings', errorMessage);
  } finally {
    yield put(setIsGameSettingsLoaded(true));
  }
}

/**
 * Изменяет текущий профиль Mod Organizer на другой, записывая изменения в файл.
 * @param moProfile Имя профиля.
*/
function* changeMOProfileSaga(
  { payload: moProfile }: ReturnType<typeof changeMoProfile>,
): SagaIterator {
  try {
    yield put(setIsGameSettingsLoaded(false));

    const {
      gameSettings: { gameSettingsFiles, gameSettingsOptions },
      system: {
        modOrganizer: {
          pathToINI,
          profileSection,
          profileParam,
          version,
        },
      },
    }: IAppState = yield select(getState);

    const iniData: IUnwrap<typeof readINIFile> = yield call(
      readINIFile,
      path.resolve(GAME_DIR, pathToINI),
    );

    changeSectionalIniParameter(
      iniData,
      profileSection,
      profileParam,
      ///TODO Переделать на поддержку кастомного RegExp
      version === 1 ? moProfile : `@ByteArray(${moProfile})`,
    );

    yield call(
      writeINIFile,
      path.resolve(GAME_DIR, pathToINI),
      iniData,
      Encoding.WIN1251,
    );

    const MOProfileGameSettingsOnly = Object.keys(gameSettingsFiles)
      .reduce<IGameSettingsFiles>((acc, curr) => {
        if (new RegExp(CustomPathName.MO_PROFILE).test(gameSettingsFiles[curr].path)) {
          return {
            ...acc,
            [curr]: {
              ...gameSettingsFiles[curr],
            },
          };
        }

        return { ...acc };
      }, {});

    const { totalGameSettingsOptions }: IUnwrap<IGenerateGameSettingsOptionsResult> = yield call(
      generateGameSettingsOptionsSaga,
      MOProfileGameSettingsOnly,
      moProfile,
    );

    yield put(setMoProfile(moProfile));
    yield put(setGameSettingsOptions({
      ...gameSettingsOptions,
      ...totalGameSettingsOptions,
    }));
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
      `Failed to change current Mod Organizer profile . Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка при изменении профиля Mod Organizer. Подробности в файле лога.')]));//eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsLoaded(true));
  }
}

/**
 * Сохранить изменения в файлах игровых настроек.
 * @param changedGameSettingsOptions Измененные опции для параметров из файлов.
*/
function* saveGameSettingsFilesSaga(
  { payload: changedGameSettingsOptions }: ReturnType<typeof saveGameSettingsFiles>,
): SagaIterator {
  try {
    yield put(setIsGameSettingsSaving(true));

    const {
      gameSettings: {
        moProfile, gameSettingsFiles, gameSettingsOptions,
      },
      system: { customPaths },
    }: IAppState = yield select(getState);
    const changedFilesNames = Object.keys(changedGameSettingsOptions);

    const changedGameSettingsFiles = Object.keys(gameSettingsFiles)
      .reduce<IGameSettingsFiles>((acc, fileName) => {
        if (changedFilesNames.includes(fileName)) {
          return {
            ...acc,
            [fileName]: gameSettingsFiles[fileName],
          };
        }

        return { ...acc };
      }, {});

    const currentFilesData: IUnwrap<IGetDataFromFilesResult> = yield call(
      getDataFromGameSettingsFilesSaga,
      changedGameSettingsFiles,
      moProfile,
      true,
    );

    const filesForWrite = Object.keys(changedGameSettingsFiles).map((fileName) => {
      const changedGameSettingsOptionsNames = Object.keys(changedGameSettingsOptions[fileName]);
      const currWriteFileData = currentFilesData[fileName];
      const currWriteFileView = changedGameSettingsFiles[fileName].view;

      changedGameSettingsOptionsNames.forEach((optionName) => {
        if (
          currWriteFileView === GameSettingsFileView.SECTIONAL
          && isDataFromIniFile(currWriteFileView, currWriteFileData)
        ) {
          const parameterNameParts = optionName.split('/');
          changeSectionalIniParameter(
            currWriteFileData,
            parameterNameParts[0],
            parameterNameParts[1],
            changedGameSettingsOptions[fileName][optionName].value,
          );
        } else if (
          currWriteFileView === GameSettingsFileView.LINE
          && isDataFromIniFile(currWriteFileView, currWriteFileData)
        ) {
          currWriteFileData.globals.lines.some((line) => {
            if (getParameterRegExp(optionName).test(line.text)) {
              line.text = line.text.replace(//eslint-disable-line no-param-reassign
                getStringPartFromIniLineParameterForReplace(line.text, optionName),
                `set ${optionName} to ${changedGameSettingsOptions[fileName][optionName].value}`,
              );

              return true;
            }

            return false;
          });
        } else if (
          currWriteFileView === GameSettingsFileView.TAG
          && !isDataFromIniFile(currWriteFileView, currWriteFileData)
        ) {
          const pathArr = [...optionName.split('/')];

          if (pathArr[pathArr.length - 1] !== '#text') {
            pathArr[pathArr.length - 1] = `${xmlAttributePrefix}${pathArr[pathArr.length - 1]}`;
          }

          setValueForObjectDeepKey(
            currWriteFileData,
            pathArr,
            changedGameSettingsOptions[fileName][optionName].value,
          );
        }
      });

      return { [fileName]: currWriteFileData };
    });

    yield all(
      filesForWrite.map((file) => {
        const fileName = Object.keys(file)[0];

        return call(
          writeGameSettingsFile,
          getPathToFile(changedGameSettingsFiles[fileName].path, customPaths, moProfile),
          file[fileName],
          changedGameSettingsFiles[fileName].view,
          changedGameSettingsFiles[fileName].encoding,
        );
      }),
    );

    const newChangedGameoptions = changedFilesNames.reduce<IGameSettingsOptions>(
      (totalOptions, fileName) => {
        const fileOtions = {
          ...gameSettingsOptions[fileName],
          ...getGameSettingsOptionsWithDefaultValues(changedGameSettingsOptions, false)[fileName],
        };

        return {
          ...totalOptions,
          [fileName]: fileOtions,
        };
      },
      {},
    );

    const newGameOptions = {
      ...gameSettingsOptions,
      ...newChangedGameoptions,
    };

    yield put(setGameSettingsOptions(newGameOptions));
    yield put(addMessages([CreateUserMessage.success('Настройки успешно сохранены.')]));
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
      `Failed to save game settings. Reason: ${errorMessage}`,
      LogMessageType.ERROR,
    );

    yield put(addMessages([CreateUserMessage.error('Произошла ошибка в процессе сохранения игровых настроек. Подробности в файле лога.')]));//eslint-disable-line max-len
  } finally {
    yield put(setIsGameSettingsSaving(false));
  }
}

export default function* gameSetingsSaga(): SagaIterator {
  yield takeLatest(GAME_SETTINGS_TYPES.CHANGE_MO_PROFILE, changeMOProfileSaga);
  yield takeLatest(GAME_SETTINGS_TYPES.SAVE_GAME_SETTINGS_FILES, saveGameSettingsFilesSaga);
}
